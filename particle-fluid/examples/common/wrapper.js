'use strict';
{
  const { GLSL1, GLSL3, WEBGL1, WEBGL2, isWebGL2Supported } = GPUIO;

  // https://github.com/amandaghassaei/canvas-capture

  const webGLSettings = {
    webGLVersion: isWebGL2Supported() ? 'WebGL 2' : 'WebGL 1',
    GLSLVersion: isWebGL2Supported() ? 'GLSL 3' : 'GLSL 1',
  };

  // Global variables to get from example app.
  let loop, dispose, composer, canvas;

  // Define webGL and GLSL version based on support
  webGLSettings.webGLVersion = isWebGL2Supported() ? 'WebGL 2' : 'WebGL 1';
  webGLSettings.GLSLVersion = isWebGL2Supported() ? 'GLSL 3' : 'GLSL 1';

  function reloadExampleWithNewParams() {
    if (canvas) {
      canvas.removeEventListener('gesturestart', disableZoom);
      canvas.removeEventListener('gesturechange', disableZoom);
      canvas.removeEventListener('gestureend', disableZoom);
    }
    if (dispose) dispose();
    ({ loop, composer, dispose, canvas } = main({
      contextID: webGLSettings.webGLVersion === 'WebGL 2' ? WEBGL2 : WEBGL1,
      glslVersion: webGLSettings.GLSLVersion === 'GLSL 3' ? GLSL3 : GLSL1,
    }));
    canvas.addEventListener('gesturestart', disableZoom);
    canvas.addEventListener('gesturechange', disableZoom);
    canvas.addEventListener('gestureend', disableZoom);
  }

  // Load example app.
  reloadExampleWithNewParams();

  // Disable gestures.
  function disableZoom(e) {
    e.preventDefault();
    const scale = 'scale(1)';
    // @ts-ignore
    document.body.style.webkitTransform = scale; // Chrome, Opera, Safari
    // @ts-ignore
    document.body.style.msTransform = scale; // IE 9
    document.body.style.transform = scale;
  }
  function outerLoop() {
    // Update fps counter.
    // Run example loop.
    if (loop) loop();
    window.requestAnimationFrame(outerLoop);
  }
  // Start loop.
  outerLoop();
}
