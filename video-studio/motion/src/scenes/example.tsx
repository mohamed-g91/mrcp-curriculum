import {makeScene2D, Rect, Txt, Line} from '@motion-canvas/2d';
import {all, createRef, waitFor, easeOutCubic} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  view.fill('#F5F1E8');
  const title = createRef<Txt>();
  const a = createRef<Rect>();
  const b = createRef<Rect>();
  const link = createRef<Line>();

  view.add(
    <>
      <Txt ref={title} text="Atrial fibrillation" fontFamily="Georgia" fontSize={72} fill="#1F1D1A" y={-260} opacity={0} />
      <Rect ref={a} x={-320} width={360} height={110} radius={24} fill="#FFFFFF" stroke="#E4DED2" lineWidth={2} opacity={0}>
        <Txt text="Rate control" fontSize={40} fill="#1F1D1A" />
      </Rect>
      <Line ref={link} points={[[-140, 0], [140, 0]]} stroke="#D97848" lineWidth={6} endArrow end={0} />
      <Rect ref={b} x={320} width={360} height={110} radius={24} fill="#FFFFFF" stroke="#E4DED2" lineWidth={2} opacity={0}>
        <Txt text="Beta-blocker" fontSize={40} fill="#D97848" />
      </Rect>
    </>,
  );

  yield* all(title().opacity(1, 0.8), title().y(-240, 0.8, easeOutCubic));
  yield* a().opacity(1, 0.5);
  yield* link().end(1, 0.7);
  yield* b().opacity(1, 0.5);
  yield* waitFor(1.5);
});
