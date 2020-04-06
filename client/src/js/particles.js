var createExplodingParticle = function({startX, startY, animationDuration, speed, radius, life, color}) {
  let particle = {
    startX,
    startY,
    animationDuration,
  }

  // // Set how long we want our particle to animate for
  // particle.animationDuration = animationDuration; // in ms

  // Set the speed for our particle
  particle.speed = {
    x: -(speed/2) + Math.random() * speed,
    y: -(speed/2) + Math.random() * speed
  };

  // Size our particle
  particle.radius = radius + Math.random() * radius;

  // Set a max time to live for our particle
  particle.life = life + Math.random() * (life/3);
  particle.remainingLife = particle.life;

  // This function will be called by our animation logic later on
  particle.draw = (ctx, delta) => {
    let p = particle;

    if(particle.remainingLife > 0
    && particle.radius > 0) {
      // Draw a circle at the current location
      ctx.beginPath();
      ctx.arc(p.startX, p.startY, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Update the particle's location and life
      p.remainingLife -= .8 * delta;
      p.radius -= (1.5 * delta);
      p.startX += (p.speed.x * delta);
      p.startY += (p.speed.y * delta);
    }
  }

  return particle
}

var createExplodingParticles = function(data) {
  let particles = []
  for(var i = 0; i < data.count; i++) {
    particles.push(createExplodingParticle(data))
  }
  return particles
}

export default {
  createExplodingParticles
}
