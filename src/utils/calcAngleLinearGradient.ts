export const calcAngleLinearGradient = (
    angle: number,
    w: number,
    h: number
) => {
    if (angle == 0 || angle == 360) {
        return [0, 0, w, 0];
    } else if (angle == 90) {
        return [0, 0, 0, h];
    } else if (angle == 180) {
        return [w, 0, 0, 0];
    } else if (angle == 270) {
        return [0, h, 0, 0];
    }
    // 移动坐标系到形状中心
    w = w / 2;
    h = h / 2;
    const limitRange = Math.abs(angle % 90);
    const r = Math.sqrt(w ** 2 + h ** 2);
    let rectAngle = Math.atan(h / w);
    let radian = (limitRange * Math.PI) / 180; // 无方向
    let linearRectWidth = r * Math.cos(rectAngle - radian); // 无方向
    let x2 = linearRectWidth * Math.cos(radian);
    let y2 = linearRectWidth * Math.sin(radian);
    // 补回方向
    if (angle < 90) {
        y2 *= -1;
    } else if (angle < 180) {
        y2 *= -1;
        x2 *= -1;
        [x2, y2] = [y2, x2];
    } else if (angle < 270) {
        x2 *= -1;
    } else {
        [x2, y2] = [y2, x2];
    }
    let x1 = -x2;
    let y1 = -y2;

    // 计算完成，移回原坐标系
    x1 = w + x1;
    y1 = h - y1;
    x2 = w + x2;
    y2 = h - y2;

    return [x1, y1, x2, y2];
};
