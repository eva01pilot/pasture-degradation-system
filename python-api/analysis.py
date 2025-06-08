
#!/usr/bin/env python3
"""
Упрощенная заглушка для системы мониторинга деградации пастбищ
Вход: JSON с координатами полигона
Выход: JSON с метриками и изображением в base64
"""

import json
import argparse
import sys
import time
import random
import base64
from datetime import datetime
from io import BytesIO

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Для работы скрипта нужно установить: pip install Pillow")
    sys.exit(1)


class PastureMonitoringStub:
    def __init__(self):
        pass
        
    def validate_coordinates(self, data):
        """Валидация координат полигона"""
        # Проверяем наличие координат
        if 'geometry' in data:
            geometry = data['geometry']
            if geometry.get('type') == 'Polygon' and 'coordinates' in geometry:
                coords = geometry['coordinates']
                if coords and len(coords[0]) >= 3:
                    return coords[0]  # Возвращаем внешнее кольцо полигона
        
        # Альтернативные форматы
        if 'coordinates' in data:
            coords = data['coordinates']
            if isinstance(coords, list) and len(coords) >= 3:
                return coords
        
        if 'polygon' in data:
            coords = data['polygon']
            if isinstance(coords, list) and len(coords) >= 3:
                return coords
        
        raise ValueError("Некорректный формат координат. Ожидается массив координат полигона.")
    
    def simulate_processing(self, coordinates):
        """Имитация обработки данных"""
        print("🛰️  Загрузка спутниковых данных...")
        time.sleep(random.uniform(0.5, 1.0))
        
        print("🌿 Анализ состояния растительности...")
        time.sleep(random.uniform(0.5, 1.0))
        
        print("📊 Расчет индексов деградации...")
        time.sleep(random.uniform(0.3, 0.8))
        
        print("🎨 Генерация слоя для карты...")
        time.sleep(random.uniform(0.2, 0.5))
        
        # Генерируем случайные, но реалистичные метрики
        metrics = {
            'ndvi_mean': round(random.uniform(0.2, 0.8), 3),
            'ndvi_std': round(random.uniform(0.05, 0.15), 3),
            'degradation_risk': random.choice(['Низкий', 'Средний', 'Высокий']),
            'vegetation_coverage': round(random.uniform(30, 85), 1),
            'soil_moisture': round(random.uniform(15, 45), 1),
            'area_hectares': round(self._calculate_area(coordinates), 2),
            'analysis_date': datetime.now().isoformat(),
            'coordinates_count': len(coordinates)
        }
        
        return metrics
    
    def _calculate_area(self, coordinates):
        """Примерный расчет площади (очень упрощенный)"""
        if len(coordinates) < 3:
            return 0.0
        
        # Упрощенный расчет через bounding box
        lats = [coord[1] for coord in coordinates]
        lons = [coord[0] for coord in coordinates]
        
        lat_diff = max(lats) - min(lats)
        lon_diff = max(lons) - min(lons)
        
        # Очень грубая оценка площади в гектарах
        area_deg_sq = lat_diff * lon_diff
        area_hectares = area_deg_sq * 111320 * 111320 / 10000  # Конвертация в гектары
        
        return max(1.0, area_hectares)  # Минимум 1 гектар
    
    def generate_result_image(self, coordinates, metrics):
        """Генерация изображения пастбища для наложения на карту"""
        # Создаем квадратное изображение 512x512 (стандартный размер тайла)
        img = Image.new('RGBA', (512, 512), color=(0, 0, 0, 0))  # Прозрачный фон
        draw = ImageDraw.Draw(img)
        
        # Цвета для разных состояний пастбища (с прозрачностью)
        colors = {
            'Низкий': (76, 175, 80, 120),      # Зеленый с прозрачностью
            'Средний': (255, 152, 0, 120),     # Оранжевый с прозрачностью
            'Высокий': (244, 67, 54, 120)      # Красный с прозрачностью
        }
        
        risk_color = colors.get(metrics['degradation_risk'], (158, 158, 158, 120))
        
        # Рисуем область пастбища как полупрозрачную заливку
        # Используем весь размер изображения с небольшими отступами
        margin = 20
        draw.rectangle([margin, margin, 512-margin, 512-margin], 
                      fill=risk_color, outline=None)
        
        # Добавляем текстуру "травы" - случайные мелкие элементы
        import random
        random.seed(42)  # Для воспроизводимости
        
        # Генерируем случайные "пятна" травы разных оттенков
        base_color = risk_color[:3]  # Убираем альфа-канал
        
        for _ in range(100):
            x = random.randint(margin, 512-margin)
            y = random.randint(margin, 512-margin)
            size = random.randint(2, 8)
            
            # Варьируем оттенок
            color_variation = random.randint(-20, 20)
            varied_color = tuple(max(0, min(255, c + color_variation)) for c in base_color)
            varied_color += (random.randint(80, 150),)  # Добавляем альфа
            
            draw.ellipse([x, y, x+size, y+size], fill=varied_color)
        
        # Добавляем несколько более крупных областей для реалистичности
        for _ in range(20):
            x = random.randint(margin, 512-margin-50)
            y = random.randint(margin, 512-margin-50)
            w = random.randint(20, 50)
            h = random.randint(20, 50)
            
            # Еще более тонкие вариации цвета
            color_variation = random.randint(-10, 10)
            varied_color = tuple(max(0, min(255, c + color_variation)) for c in base_color)
            varied_color += (random.randint(60, 100),)  # Добавляем альфа
            
            draw.ellipse([x, y, x+w, y+h], fill=varied_color)
        
        return img
    
    def image_to_base64(self, image):
        """Конвертация изображения в base64"""
        buffer = BytesIO()
        # Сохраняем как PNG с прозрачностью для наложения на карту
        image.save(buffer, format='PNG', optimize=True)
        img_bytes = buffer.getvalue()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        return img_base64
    
    def process(self, input_data):
        """Основная функция обработки"""
        print("📍 Обработка координат полигона...")
        
        # Валидируем координаты
        coordinates = self.validate_coordinates(input_data)
        print(f"✅ Получено координат: {len(coordinates)}")
        
        # Имитируем обработку
        metrics = self.simulate_processing(coordinates)
        
        # Генерируем изображение
        result_image = self.generate_result_image(coordinates, metrics)
        
        # Конвертируем в base64
        image_base64 = self.image_to_base64(result_image)
        
        # Формируем результат
        result = {
            'status': 'success',
            'metrics': metrics,
            'image_base64': image_base64,
            'image_format': 'PNG'
        }
        
        print("✅ Обработка завершена!")
        return result


def main():
    parser = argparse.ArgumentParser(
        description='Заглушка для системы мониторинга деградации пастбищ'
    )
    parser.add_argument('input_file', help='Путь к JSON файлу с координатами')
    parser.add_argument('-o', '--output', help='Путь для сохранения результата (опционально)')
    
    args = parser.parse_args()
    
    try:
        # Читаем входные данные
        with open(args.input_file, 'r', encoding='utf-8') as f:
            input_data = json.load(f)
        
        # Обрабатываем
        processor = PastureMonitoringStub()
        result = processor.process(input_data)
        
        # Выводим результат
        if args.output:
            # Сохраняем в файл
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"💾 Результат сохранен в: {args.output}")
        else:
            # Выводим в stdout (для API)
            print("\n" + "="*50)
            print("РЕЗУЛЬТАТ (JSON):")
            print("="*50)
            print(json.dumps(result, ensure_ascii=False, indent=2))
        
        # Показываем краткую сводку
        print(f"\n📊 Краткие результаты:")
        print(f"   Риск деградации: {result['metrics']['degradation_risk']}")
        print(f"   NDVI: {result['metrics']['ndvi_mean']}")
        print(f"   Площадь: {result['metrics']['area_hectares']} га")
        print(f"   Размер PNG слоя: {len(result['image_base64'])} символов base64")
        print(f"   Формат: 512x512 PNG с прозрачностью для наложения на карту")
        
    except Exception as e:
        error_result = {
            'status': 'error',
            'error_message': str(e)
        }
        
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(error_result, f, ensure_ascii=False, indent=2)
        else:
            print(json.dumps(error_result, ensure_ascii=False, indent=2))
        
        print(f"❌ Ошибка: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
