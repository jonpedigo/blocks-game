/**
 * @class Initializes a 1D shakeing pattern
 * @param {int} duration The length of the shake in miliseconds
 * @param {int} frequency The frequency of the shake in Hertz
 */
var Shake = function(duration, frequency)
{
  // The duration in miliseconds
  this.duration = parseInt(duration);

  // The frequency in Hz
  this.frequency = parseInt(frequency);

  // The sample count = number of peaks/valleys in the Shake
  var sampleCount = (duration/1000) * frequency;

  // Populate the samples array with randomized values between -1.0 and 1.0
  this.samples = [];
  for(var i = 0; i < sampleCount; i++) {
    this.samples.push(Math.random() * 2 - 1);
  }

  // Init the time variables
  this.startTime = null;
  this.t = null

  // Flag that represents if the shake is active
  this.isShaking = false;
};

/**
 * Start the shake, initializing time variables and flags
 */
Shake.prototype.start = function()
{
  this.startTime = new Date().getTime();
  this.t = 0;
  this.isShaking = true;
};

/**
 * Update the shake, setting the current time variable
 */
Shake.prototype.update = function()
{
  this.t = new Date().getTime() - this.startTime;
  if(this.t > this.duration) this.isShaking = false;
};

/**
 * Retrieve the amplitude. If "t" is passed, it will get the amplitude for the
 * specified time, otherwise it will use the internal time.
 * @param {int} t (optional) The time since the start of the shake in miliseconds
 */
Shake.prototype.amplitude = function(t)
{
  // Check if optional param was passed
  if(t == undefined) {
    // return zero if we are done shaking
    if(!this.isShaking) return 0;
    t = this.t;
  }

  // Get the previous and next sample
  var s = t / 1000 * this.frequency;
  var s0 = Math.floor(s);
  var s1 = s0 + 1;

  // Get the current decay
  var k = this.decay(t);

  // Return the current amplitude
  return (this.noise(s0) + (s - s0)*(this.noise(s1) - this.noise(s0))) * k;
};

/**
 * Retrieve the noise at the specified sample.
 * @param {int} s The randomized sample we are interested in.
 */
Shake.prototype.noise = function(s)
{
  // Retrieve the randomized value from the samples
  if(s >= this.samples.length) return 0;
  return this.samples[s];
};

/**
 * Get the decay of the shake as a floating point value from 0.0 to 1.0
 * @param {int} t The time since the start of the shake in miliseconds
 */
Shake.prototype.decay = function(t)
{
  // Linear decay
  if(t >= this.duration) return 0;
  return (this.duration - t) / this.duration;
};

export default Shake
