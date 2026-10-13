import {defineConfig} from 'vite';
import motionCanvasModule from '@motion-canvas/vite-plugin';
import ffmpegModule from '@motion-canvas/ffmpeg';

// Both plugins ship as CommonJS, so the function can arrive wrapped in `.default`.
const motionCanvas = (motionCanvasModule as any).default ?? motionCanvasModule;
const ffmpeg = (ffmpegModule as any).default ?? ffmpegModule;

export default defineConfig({
  plugins: [motionCanvas(), ffmpeg()],
  server: {port: 9000, open: true},
});
