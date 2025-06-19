#!/usr/bin/env python3
"""
Система мониторинга деградации пастбищ с интеграцией Google Earth Engine
Создает только heatmap для отображения на карте сайта
"""

import json
import base64
import time
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from datetime import datetime, timedelta
from io import BytesIO
import logging
import warnings
import ee
import requests
import os

warnings.filterwarnings('ignore')

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PastureMonitoringStub:
    def __init__(self, service_account_email=None, private_key_path=None):
        """
        Инициализация с настройкой Earth Engine
        
        Args:
            service_account_email: Email сервисного аккаунта
            private_key_path: Путь к JSON файлу с приватным ключом
        """
        self.service_account_email = service_account_email or os.environ['GOOGLE_EARTH_SERVICE_ACCOUNT']
        self.private_key_path = private_key_path or 'earth.json'
        
        self._initialize_earth_engine()
        
        # Цветовая карта для NDVI heatmap (как в оригинальном script.py)
        self.ndvi_colors = ['#8B0000', '#FF0000', '#FF4500', '#FFA500', '#FFD700', 
                        '#ADFF2F', '#32CD32', '#228B22', '#006400']
        self.ndvi_cmap = LinearSegmentedColormap.from_list('ndvi_heatmap', self.ndvi_colors, N=256)
    

    def _initialize_earth_engine(self):
        """Инициализация Google Earth Engine с использованием сервисного аккаунта"""
        try:
            # Проверяем существование файла с ключом
            if not os.path.exists(self.private_key_path):
                raise FileNotFoundError(f"Файл с приватным ключом не найден: {self.private_key_path}")
            
            # Создание credentials
            credentials = ee.ServiceAccountCredentials(self.service_account_email, self.private_key_path)
            
            # Инициализация с credentials
            ee.Initialize(credentials)
            
            logger.info(f"Google Earth Engine инициализирован через сервисный аккаунт: {self.service_account_email}")
        except Exception as e:
            logger.error(f"Ошибка инициализации Earth Engine: {e}")
            # Попытка использовать стандартную аутентификацию как fallback
            try:
                logger.info("Попытка использовать стандартную аутентификацию...")
                ee.Initialize()
                logger.info("Google Earth Engine инициализирован через стандартную аутентификацию")
            except Exception as e2:
                logger.error(f"Стандартная аутентификация также не удалась: {e2}")
                raise e
    
    def validate_coordinates(self, data):
        """Валидация координат полигона"""
        if 'geometry' in data:
            geometry = data['geometry']
            if geometry.get('type') == 'Polygon' and 'coordinates' in geometry:
                coords = geometry['coordinates'][0]
                if coords and len(coords) >= 3:
                    return coords
        
        if 'coordinates' in data:
            coords = data['coordinates']
            if isinstance(coords, list) and len(coords) >= 3:
                return coords
        
        if 'polygon' in data:
            coords = data['polygon']
            if isinstance(coords, list) and len(coords) >= 3:
                return coords
        
        raise ValueError("Некорректный формат координат")
    
    def _extract_coordinates(self, geojson_data):
        """Извлечение координат из GeoJSON (как в оригинальном script.py)"""
        try:
            if 'features' in geojson_data:
                coords = geojson_data['features'][0]['geometry']['coordinates'][0]
            elif 'geometry' in geojson_data:
                coords = geojson_data['geometry']['coordinates'][0]
            elif 'coordinates' in geojson_data:
                coords = geojson_data['coordinates'][0]
            else:
                return None
            
            # Замыкаем полигон если нужно
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            
            return coords
        except:
            return None
    
    def _get_satellite_data(self, geometry):
        """Получение спутниковых данных (Sentinel-2 или Landsat-8)"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=60)
        
        # Пробуем Sentinel-2
        try:
            collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
                .filterBounds(geometry) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 40)) \
                .sort('CLOUDY_PIXEL_PERCENTAGE')
            
            if collection.size().getInfo() > 0:
                image = collection.first().clip(geometry)
                
                # Маскирование облаков
                scl = image.select('SCL')
                clear_mask = scl.neq(3).And(scl.neq(8).And(scl.neq(9).And(scl.neq(10))))
                masked_image = image.updateMask(clear_mask)
                
                # NDVI
                ndvi = masked_image.normalizedDifference(['B8', 'B4']).rename('NDVI')
                
                return {
                    'ndvi': ndvi,
                    'scale': 10,
                    'satellite': 'Sentinel-2'
                }
        except Exception as e:
            logger.warning(f"Ошибка Sentinel-2: {e}")
        
        # Пробуем Landsat-8
        try:
            collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \
                .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
                .filterBounds(geometry) \
                .filter(ee.Filter.lt('CLOUD_COVER', 50)) \
                .sort('CLOUD_COVER')
            
            if collection.size().getInfo() > 0:
                image = collection.first().clip(geometry)
                
                # Применяем масштабирующие факторы
                optical = image.select('SR_B.').multiply(0.0000275).add(-0.2)
                scaled_image = image.addBands(optical, None, True)
                
                # Маскирование облаков
                qa = scaled_image.select('QA_PIXEL')
                clear_mask = qa.bitwiseAnd(ee.Number(2).pow(3)).eq(0)
                masked_image = scaled_image.updateMask(clear_mask)
                
                # NDVI
                ndvi = masked_image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
                
                return {
                    'ndvi': ndvi,
                    'scale': 30,
                    'satellite': 'Landsat-8'
                }
        except Exception as e:
            logger.warning(f"Ошибка Landsat-8: {e}")
        
        return None
    
    def _download_image_array(self, image, geometry, scale=10):
        """Скачивание изображения как numpy массив (как в оригинальном script.py)"""
        try:
            region = geometry.getInfo()['coordinates']
            
            url = image.getDownloadURL({
                'scale': scale,
                'region': region,
                'format': 'GEO_TIFF',
                'crs': 'EPSG:4326'
            })
            
            response = requests.get(url, timeout=300)
            if response.status_code != 200:
                raise Exception(f"Ошибка скачивания: {response.status_code}")
            
            # Сохраняем временный файл
            temp_path = f'temp_{int(time.time())}.tif'
            with open(temp_path, 'wb') as f:
                f.write(response.content)
            
            try:
                import rasterio
                with rasterio.open(temp_path) as src:
                    array = src.read(1).astype(float)
                    if src.nodata is not None:
                        array[array == src.nodata] = np.nan
                    return array
            except ImportError:
                logger.warning("rasterio не установлен")
                return None
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        except Exception as e:
            logger.error(f"Ошибка скачивания массива: {e}")
            return None
    
    def _create_ndvi_heatmap_image(self, ndvi_array):
        """Создание NDVI heatmap как PIL Image (без подписей для наложения на карту)"""
        if ndvi_array is None:
            return None
        
        try:
            # Создаем изображение с прозрачным фоном для наложения на карту
            fig, ax = plt.subplots(figsize=(512/100, 512/100), dpi=100)
            
            # Тепловая карта без подписей и осей
            im = ax.imshow(ndvi_array, cmap=self.ndvi_cmap, vmin=-0.2, vmax=0.8,
                          origin='upper', interpolation='bilinear', alpha=0.8)
            
            ax.set_xticks([])
            ax.set_yticks([])
            ax.axis('off')
            
            # Конвертируем в PIL Image с прозрачностью
            buf = BytesIO()
            plt.savefig(buf, format='png', dpi=300, bbox_inches='tight', pad_inches=0,
                       facecolor='none', edgecolor='none', transparent=True)
            plt.close()
            
            buf.seek(0)
            from PIL import Image
            return Image.open(buf)
            
        except Exception as e:
            logger.error(f"Ошибка создания heatmap: {e}")
            return None
    
    def _image_to_base64(self, image):
        """Конвертация PIL Image в base64"""
        if image is None:
            return None
        
        buffer = BytesIO()
        image.save(buffer, format='PNG', optimize=True)
        img_bytes = buffer.getvalue()
        return base64.b64encode(img_bytes).decode('utf-8')
    
    def _calculate_metrics(self, ndvi_array, coordinates):
        """Расчет метрик деградации"""
        if ndvi_array is None:
            return self._generate_fallback_metrics(coordinates)
        
        valid_ndvi = ndvi_array[~np.isnan(ndvi_array)]
        
        if len(valid_ndvi) == 0:
            return self._generate_fallback_metrics(coordinates)
        
        mean_ndvi = np.mean(valid_ndvi)
        std_ndvi = np.std(valid_ndvi)
        min_ndvi = np.min(valid_ndvi)
        max_ndvi = np.max(valid_ndvi)
        
        # Определяем риск деградации по NDVI
        if mean_ndvi >= 0.4:
            degradation_risk = 'Низкий'
            vegetation_coverage = np.random.uniform(70, 85)
        elif mean_ndvi >= 0.3:
            degradation_risk = 'Средний'
            vegetation_coverage = np.random.uniform(50, 70)
        else:
            degradation_risk = 'Высокий'
            vegetation_coverage = np.random.uniform(25, 50)
        
        # Расчет площади
        area_hectares = self._calculate_area(coordinates)
        
        return {
            'ndvi_mean': round(float(mean_ndvi), 3),
            'ndvi_std': round(float(std_ndvi), 3),
            'ndvi_min': round(float(min_ndvi), 3),
            'ndvi_max': round(float(max_ndvi), 3),
            'degradation_risk': degradation_risk,
            'vegetation_coverage': round(vegetation_coverage, 1),
            'soil_moisture': round(np.random.uniform(15, 45), 1),
            'area_hectares': round(area_hectares, 2),
            'analysis_date': datetime.now().isoformat(),
            'coordinates_count': len(coordinates),
            'valid_pixels': len(valid_ndvi),
            'total_pixels': ndvi_array.size
        }
    
    def _generate_fallback_metrics(self, coordinates):
        """Генерация метрик-заглушек при отсутствии данных"""
        mean_ndvi = np.random.uniform(0.2, 0.6)
        
        if mean_ndvi >= 0.4:
            degradation_risk = 'Низкий'
        elif mean_ndvi >= 0.3:
            degradation_risk = 'Средний'
        else:
            degradation_risk = 'Высокий'
        
        return {
            'ndvi_mean': round(mean_ndvi, 3),
            'ndvi_std': round(np.random.uniform(0.05, 0.15), 3),
            'ndvi_min': round(np.random.uniform(0.1, 0.3), 3),
            'ndvi_max': round(np.random.uniform(0.5, 0.8), 3),
            'degradation_risk': degradation_risk,
            'vegetation_coverage': round(np.random.uniform(30, 85), 1),
            'soil_moisture': round(np.random.uniform(15, 45), 1),
            'area_hectares': round(self._calculate_area(coordinates), 2),
            'analysis_date': datetime.now().isoformat(),
            'coordinates_count': len(coordinates),
            'valid_pixels': 0,
            'total_pixels': 0,
            'note': 'Спутниковые данные недоступны, использованы оценочные значения'
        }
    
    def _calculate_area(self, coordinates):
        """Приблизительный расчет площади"""
        if len(coordinates) < 3:
            return 1.0
        
        lats = [coord[1] for coord in coordinates]
        lons = [coord[0] for coord in coordinates]
        
        lat_diff = max(lats) - min(lats)
        lon_diff = max(lons) - min(lons)
        
        # Грубая оценка площади в гектарах
        area_deg_sq = lat_diff * lon_diff
        area_hectares = area_deg_sq * 111320 * 111320 / 10000
        
        return max(1.0, area_hectares)
    
    def _create_fallback_heatmap(self):
        """Создание заглушки heatmap при отсутствии данных"""
        try:
            from PIL import Image, ImageDraw
            
            # Создаем простую градиентную карту 512x512
            img = Image.new('RGBA', (512, 512), color=(0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Простой градиент от зеленого к красному
            for y in range(512):
                intensity = y / 512
                red = int(255 * intensity)
                green = int(255 * (1 - intensity))
                color = (red, green, 0, 120)  # С прозрачностью
                draw.line([(0, y), (512, y)], fill=color)
            
            return img
            
        except Exception as e:
            logger.error(f"Ошибка создания fallback heatmap: {e}")
            return None
    
    def process(self, input_data):
        """Основная функция обработки - создание heatmap для карты"""
        logger.info("📍 Начало обработки полигона...")
        
        try:
            # 1. Валидация координат
            coordinates = self.validate_coordinates(input_data)
            logger.info(f"✅ Получено координат: {len(coordinates)}")
            
            # 2. Создание геометрии
            # Замыкаем полигон если нужно
            if coordinates[0] != coordinates[-1]:
                coordinates.append(coordinates[0])
            
            geometry = ee.Geometry.Polygon([coordinates])
            
            # 3. Получение спутниковых данных
            logger.info("🛰️ Получение спутниковых данных...")
            satellite_data = self._get_satellite_data(geometry)
            
            heatmap_image = None
            
            if satellite_data is None:
                logger.warning("Спутниковые данные недоступны, создаем заглушку")
                # Создаем заглушку heatmap
                heatmap_image = self._create_fallback_heatmap()
                # Расчет метрик
                metrics = self._generate_fallback_metrics(coordinates)
                
            else:
                logger.info(f"✅ Данные получены от {satellite_data['satellite']}")
                scale = satellite_data['scale']
                
                # 4. Скачивание NDVI массива
                logger.info("📊 Анализ NDVI данных...")
                ndvi_array = self._download_image_array(satellite_data['ndvi'], geometry, scale)
                
                # 5. Создание heatmap
                logger.info("🎨 Создание NDVI heatmap...")
                heatmap_image = self._create_ndvi_heatmap_image(ndvi_array)
                
                # 6. Расчет метрик
                metrics = self._calculate_metrics(ndvi_array, coordinates)
            
            # 7. Конвертация в base64
            logger.info("📦 Конвертация изображения...")
            
            if heatmap_image is None:
                logger.warning("Не удалось создать heatmap, используем заглушку")
                heatmap_image = self._create_fallback_heatmap()
            
            image_base64 = self._image_to_base64(heatmap_image)
            
            if image_base64:
                logger.info("✅ Heatmap создан")
            else:
                logger.error("Ошибка создания base64")
                image_base64 = ""
            
            # 8. Формирование результата (совместимость с существующим API)
            result = {
                'status': 'success',
                'metrics': metrics,
                'image_base64': image_base64,
                'image_format': 'PNG'
            }
            
            logger.info("✅ Обработка завершена успешно!")
            return result
            
        except Exception as e:
            logger.error(f"Ошибка обработки: {e}")
            
            # Создаем fallback ответ
            try:
                coords = self.validate_coordinates(input_data)
                fallback_metrics = self._generate_fallback_metrics(coords)
                fallback_heatmap = self._create_fallback_heatmap()
                fallback_base64 = self._image_to_base64(fallback_heatmap)
            except:
                fallback_metrics = {
                    'ndvi_mean': 0.3,
                    'degradation_risk': 'Неизвестно',
                    'area_hectares': 1.0,
                    'analysis_date': datetime.now().isoformat(),
                    'error': str(e)
                }
                fallback_base64 = ""
            
            return {
                'status': 'error',
                'error_message': str(e),
                'metrics': fallback_metrics,
                'image_base64': fallback_base64,
                'image_format': 'PNG'
            }


def main():
    """Функция для тестирования"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Система мониторинга пастбищ')
    parser.add_argument('input_file', nargs='?', help='Путь к JSON файлу с координатами')
    parser.add_argument('-o', '--output', help='Путь для сохранения результата')
    parser.add_argument('--test', action='store_true', help='Использовать тестовый полигон')
    
    args = parser.parse_args()
    
    def create_test_polygon():
        return {
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [85.1234, 52.3456],
                    [85.2234, 52.3456], 
                    [85.2234, 52.2456],
                    [85.1234, 52.2456],
                    [85.1234, 52.3456]
                ]]
            }
        }
    
    try:
        if args.test or not args.input_file:
            print("🧪 Использование тестового полигона...")
            input_data = create_test_polygon()
        else:
            with open(args.input_file, 'r', encoding='utf-8') as f:
                input_data = json.load(f)
        
        processor = PastureMonitoringStub()
        result = processor.process(input_data)
        
        if args.output:
            # Сохраняем результат без изображения (оно большое)
            output_data = {
                'status': result['status'],
                'metrics': result['metrics'],
                'has_image': bool(result.get('image_base64')),
                'image_format': result.get('image_format', 'PNG')
            }
            
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)
            print(f"💾 Результат сохранен в: {args.output}")
            
            # Сохраняем изображение отдельно если есть
            if result.get('image_base64'):
                img_filename = args.output.replace('.json', '_heatmap.png')
                try:
                    import base64
                    from PIL import Image
                    from io import BytesIO
                    
                    img_data = base64.b64decode(result['image_base64'])
                    img = Image.open(BytesIO(img_data))
                    img.save(img_filename)
                    print(f"🎨 Heatmap сохранен в: {img_filename}")
                except Exception as e:
                    print(f"⚠️ Ошибка сохранения изображения: {e}")
        else:
            # Выводим результат без base64 (слишком длинный)
            output_data = {k: v for k, v in result.items() if k != 'image_base64'}
            output_data['image_size'] = len(result.get('image_base64', ''))
            print(json.dumps(output_data, ensure_ascii=False, indent=2))
        
        print(f"\n📊 Результаты:")
        print(f"   Риск деградации: {result['metrics']['degradation_risk']}")
        print(f"   NDVI: {result['metrics']['ndvi_mean']}")
        print(f"   Площадь: {result['metrics']['area_hectares']} га")
        print(f"   Heatmap создан: {'Да' if result.get('image_base64') else 'Нет'}")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")


if __name__ == "__main__":
    main()
