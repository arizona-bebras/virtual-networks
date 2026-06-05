// Тригонометрические утилиты для работы с циферблатом

/**
 * Рассчитывает угол (в градусах) между центром (cx, cy) и точкой (x, y).
 * 0 градусов находится на 12 часов (сверху).
 */
export function getAngle(cx: number, cy: number, x: number, y: number): number {
  const dx = x - cx;
  const dy = y - cy;
  // atan2(y, x) дает угол от оси X (вправо).
  // Вычитаем 90 градусов (или добавляем 90 к результату, если менять оси)
  // Чтобы 0 был сверху, мы используем atan2(dx, -dy)
  let theta = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (theta < 0) {
    theta += 360;
  }
  return theta;
}

/**
 * Округляет угол до ближайшего шага.
 * Для часов: step = 30
 * Для минут: step = 6
 */
export function roundToNearest(angle: number, step: number): number {
  return Math.round(angle / step) * step;
}

/**
 * Рассчитывает расстояние между двумя точками.
 */
export function getDistance(
  cx: number,
  cy: number,
  x: number,
  y: number,
): number {
  const dx = x - cx;
  const dy = y - cy;
  return Math.sqrt(dx * dx + dy * dy);
}
