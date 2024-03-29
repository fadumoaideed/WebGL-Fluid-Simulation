'use strict';
{
  const { GLSL1, GLSL3, WEBGL1, WEBGL2, isWebGL2Supported } = GPUIO;

  // https://github.com/amandaghassaei/canvas-capture
  const CanvasCapture = window.CanvasCapture.CanvasCapture;
  const RECORD_FPS = 60;

  // Init a simple gui.
  const pane = new Tweakpane.Pane();
  // Init a pane to toggle main mane visibility.
  const paneToggle = new Tweakpane.Pane();
  paneToggle.expanded = false;
  pane.containerElem_.style.display = 'none';

  // Init an overlay to prevent click events from bubbling through
  // modal to gui or canvas.
  // Show/hide overlay when modal is opened/closed.
  const overlay = document.createElement('div');
  overlay.id = 'touchOverlay';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.opacity = 0;
  overlay.style.position = 'absolute';
  overlay.style['z-index'] = 1;
  overlay.style.display = 'none';
  document.body.append(overlay);

  const webGLSettings = {
    webGLVersion: isWebGL2Supported() ? 'WebGL 2' : 'WebGL 1',
    GLSLVersion: isWebGL2Supported() ? 'GLSL 3' : 'GLSL 1',
  };
  const availableWebGLVersions = { webgl1: 'WebGL 1' };
  const availableGLSLVersions = { glsl1: 'GLSL 1' };
  if (isWebGL2Supported()) {
    availableWebGLVersions.webgl2 = 'WebGL 2';
    availableGLSLVersions.glsl3 = 'GLSL 3';
  }

  // Global variables to get from example app.
  let loop, dispose, composer, canvas;
  // Other global ui variables.
  let title = webGLSettings.webGLVersion;
  let useGLSL3Toggle;

  function reloadExampleWithNewParams() {
    if (useGLSL3Toggle) {
      useGLSL3Toggle.dispose();
      useGLSL3Toggle = undefined;
    }
    if (canvas) {
      canvas.addEventListener('gesturestart', disableZoom);
      canvas.addEventListener('gesturechange', disableZoom);
      canvas.addEventListener('gestureend', disableZoom);
    }
    if (webGLSettings.webGLVersion === 'WebGL 1')
      webGLSettings.GLSLVersion = 'GLSL 1';
    if (dispose) dispose();
    ({ loop, composer, dispose, canvas } = main({
      contextID: webGLSettings.webGLVersion === 'WebGL 2' ? WEBGL2 : WEBGL1,
      glslVersion: webGLSettings.GLSLVersion === 'GLSL 3' ? GLSL3 : GLSL1,
    }));
    canvas.addEventListener('gesturestart', disableZoom);
    canvas.addEventListener('gesturechange', disableZoom);
    canvas.addEventListener('gestureend', disableZoom);

    title = `${webGLSettings.webGLVersion}`;
    settings.title = title;

    CanvasCapture.dispose();
    CanvasCapture.init(canvas, {
      showRecDot: true,
      showDialogs: true,
      showAlerts: true,
      recDotCSS: { left: '0', right: 'auto' },
    });
    CanvasCapture.bindKeyToVideoRecord('v', {
      format: CanvasCapture.WEBM,
      name: 'screen_recording',
      fps: RECORD_FPS,
      quality: 1,
    });
  }

  // Add some settings to gui.
  const settings = pane.addFolder({
    title,
    expanded: false,
  });

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

  let numFrames = 0;

  function outerLoop() {
    // Update fps counter.
    const { fps, numTicks } = composer.tick();
    if (numTicks % 10 === 0) {
      settings.title = `${title} (${fps.toFixed(1)} FPS)`;
    }
    window.requestAnimationFrame(outerLoop);
    // Run example loop.
    if (loop) loop();
  }
  // Start loop.
  outerLoop();
}
