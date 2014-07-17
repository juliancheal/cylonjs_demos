var Cylon = require('cylon');

Cylon.robot({
  connections: [
    {
      name: 'dualshock3',
      adaptor: 'joystick',
      controller: 'dualshock3'
    }, {
      name: 'ardrone',
      adaptor: 'ardrone',
      port: '192.168.1.101'
    }
  ],
  devices: [
    {
      name: 'controller',
      driver: 'dualshock3',
      connection: 'dualshock3'
    }, {
      name: 'drone',
      driver: 'ardrone',
      connection: 'ardrone'
    }
  ],
  validate_pitch: function(data, offset) {
    var value;
    value = Math.abs(data) / offset;
    if (value >= 0.1) {
      if (value <= 1.0) {
        return Math.round(value * 100.0) / 100.0;
      } else {
        return 1.0;
      }
    } else {
      return 0.0;
    }
  },
  work: function(my) {
    var offset = 125.0;
		var right_stick = {
		  x: offset,
		  y: offset
		};
		var left_stick = {
		  x: offset,
		  y: offset
		};
	
    // var button_states, buttons;
    // button_states = ["press", "release"];
    // buttons = ["x", "square", "circle", "triangle", "l1", "r1", "l2", "r2", "left", "right", "select", "start", "dpad:left", "dpad:right", "dpad:up", "dpad:down", "psbutton"];
    // buttons.forEach(function(button) {
    //   return button_states.forEach(function(state) {
    //     return my.controller.on("" + button + ":" + state, function() {
    //       return console.log(button, state);
    //     });
    //   });
    // });

    my.controller.on("start:press", function() {
			console.log("Takeoff");
      return my.drone.takeoff();
    });
    my.controller.on("triangle:press", function() {
			console.log("Hover");
      return my.drone.hover();
    });
    my.controller.on("x:press", function() {
			console.log("flip");
      return my.drone.animate("flipLeft", 150);
    });
    my.controller.on("square:press", function() {
			console.log("led");
      return my.drone.animateLeds('snakeGreenRed', 5, 4*60)
    });
    my.controller.on("select:press", function() {
			console.log("Land");
      return my.drone.land();
    });
		
		my.controller.on("right:move", function(pair) {
			return right_stick = pair;
    });
    my.controller.on("left:move", function(pair) {
			return left_stick = pair;
    });
    every(0, function() {
			var pair;
			pair = left_stick;
			 if (pair.y < offset - 5) {
			   my.drone.front(my.validate_pitch(pair.y - offset, offset));
			 } else if (pair.y > offset + 5) {
			   my.drone.back(my.validate_pitch(pair.y - offset, offset));
			 }
			 if (pair.x > offset + 5) {
			 	 console.log(my.validate_pitch(pair.x - offset, offset));
			   return my.drone.right(my.validate_pitch(pair.x - offset, offset));
			 } else if (pair.x < offset - 5) {
				 console.log(my.validate_pitch(pair.x - offset, offset));
			   return my.drone.left(my.validate_pitch(pair.x - offset, offset));
			 }
    });

    every(0, function() {
      var pair;
      pair = right_stick;
      if (pair.y < offset - 5) {
        my.drone.up(my.validate_pitch(pair.y - offset, offset));
      } else if (pair.y > offset + 5) {
        my.drone.down(my.validate_pitch(pair.y - offset, offset));
      }
      if (pair.x > offset + 20) {
				console.log(my.validate_pitch(pair.x - offset, offset));
        return my.drone.clockwise(my.validate_pitch(pair.x - offset, offset));
      } else if (pair.x < offset - 20) {
				console.log(my.validate_pitch(pair.x - offset, offset));
        return my.drone.counterClockwise(my.validate_pitch(pair.x - offset, offset));
      }
    });
		every(0.1.seconds(), function() {
 			my.drone.hover();
    });
  }
});

Cylon.start();