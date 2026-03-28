export const SAMPLE_READER_TEXT = `
Gaze-guided reading asks a simple question: how little can your eyes move while you still read comfortably?
Most digital reading forces constant micro-navigation—return sweeps, refixations, chasing the next line.
Here, the page scrolls gently so text drifts through a calm band in front of you instead of you chasing it.

The control loop treats eye tracking as a noisy signal, not a laser pointer.
Vertical drift nudges the column when your attention sits below or above a soft band.
Horizontal motion is rare: only when your gaze leaves a wide lane do we nudge the column back toward center.
When confidence drops, the motion decays instead of fighting you.

This prototype runs entirely in your browser.
Your camera frames are not uploaded; WebGazer performs on-device estimation.
Calibration matters: take a moment, click the nine targets while looking directly at each dot,
and the ridge regressors inside WebGazer get a fighting chance on a laptop webcam.

Smooth motion uses two stages: filtering gaze, then limiting jerk and smoothing scroll velocity.
If your system requests reduced motion, automatic scrolling turns off—you still keep full keyboard control.

Try mock mode first: it replays predictable gaze paths so you can feel the controller without the camera.
Then switch to the webcam, recalibrate in good light, and see whether your eye travel feels quieter than before.
If horizontal corrections ever feel slippery, widen the lane and lower horizontal gain in settings.

Reading is not a contest for maximum words per minute.
The goal is sustainable attention: less hunting, fewer surprises, and a page that moves with you instead of against you.
`.trim()
