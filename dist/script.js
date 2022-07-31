(() => {
  "use strict";

  //-----------------------------------------------------------
  // Variables
  //-----------------------------------------------------------

  const w_rand = [
  { value: "left", chance: 0.45 },
  { value: "right", chance: 0.45 },
  { value: "both", chance: 0.1 }];


  let count_down = 0;
  let time_left = 0;
  let game_over = true;
  let vawe = false;
  let score = 0;
  let combo = 0;

  let surface = {};
  let room = [
  {
    bg_0: {},
    bg_1: {},
    out: [],
    emit_l: [],
    emit_r: [],
    trail: [],
    cursor: {} }];



  // FPS meter variables
  let secondsPassed = 0;
  let oldTimeStamp = 0;
  let fps = 0;

  const init = () => {
    surface = new MG.Surface("#surface", 16, 9);
    surface.ctx.imageSmoothingEnabled = false;

    room[0].bg_0 = new MG.Background({
      src:
      "https://raw.githubusercontent.com/elsemeow/cdn/main/img/cdpn/poLerLQ/bg-0.png",
      sW: 800,
      sH: 448,
      pos: surface.pos("mc"),
      dW: 250,
      dH: 140 });

    room[0].bg_0.u2p(surface);

    room[0].bg_1 = new MG.Background({
      src:
      "https://raw.githubusercontent.com/elsemeow/cdn/main/img/cdpn/poLerLQ/bg-1.png",
      sW: 800,
      sH: 448,
      pos: surface.pos("mc"),
      dW: 250,
      dH: 140 });

    room[0].bg_1.u2p(surface);

    for (let i = 1; i <= 30; i++) {
      room[0].trail[i - 1] = new MG.Entity(
      "mc",
      new SAT.Circle(surface.pos("mc"), i * 0.01 + 0.5),
      new MG.Particle(),
      new MG.Sprite());

      room[0].trail[i - 1].u2p(surface);
    }

    room[0].cursor = new MG.Entity(
    "mc",
    new SAT.Circle(surface.pos("mc"), 3),
    new MG.Particle(),
    new MG.Sprite(),
    { aim_pos: new SAT.V(surface.w / 2, surface.h / 2) });

    room[0].cursor.u2p(surface);

    window.onresize = () => {
      resize_throttling(() => {
        room[0].bg_0.p2u(surface);
        room[0].bg_1.p2u(surface);
        for (let i = 0; i < room[0].emit_l.length; i++) {
          room[0].emit_l[i].p2u(surface);
        }
        for (let i = 0; i < room[0].emit_r.length; i++) {
          room[0].emit_r[i].p2u(surface);
        }
        for (let i = 0; i < room[0].out.length; i++) {
          room[0].out[i].p2u(surface);
        }
        for (let i = 0; i < room[0].trail.length; i++) {
          room[0].trail[i].p2u(surface);
        }
        room[0].cursor.p2u(surface);

        surface.resize();

        room[0].bg_0.u2p(surface);
        room[0].bg_1.u2p(surface);
        for (let i = 0; i < room[0].emit_l.length; i++) {
          room[0].emit_l[i].u2p(surface);
        }
        for (let i = 0; i < room[0].emit_r.length; i++) {
          room[0].emit_r[i].u2p(surface);
        }
        for (let i = 0; i < room[0].out.length; i++) {
          room[0].out[i].u2p(surface);
        }
        for (let i = 0; i < room[0].trail.length; i++) {
          room[0].trail[i].u2p(surface);
        }
        room[0].cursor.u2p(surface);
      }, 500);
    };

    surface.el.addEventListener("mousemove", event => {
      room[0].cursor.vars.aim_pos = new SAT.V(event.offsetX, event.offsetY);
    });

    surface.el.addEventListener("click", event => {
      room[0].cursor.collision.pos = room[0].cursor.vars.aim_pos;
      combo = 0;
    });

    let game_timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = count_down - now;
      const minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
      const seconds = Math.floor(distance % (1000 * 60) / 1000);

      time_left = minutes + ":" + seconds;

      if (distance < 0) {
        clearInterval(game_timer);
        time_left = "0:0";
        game_over = true;

        document.querySelector("#score").innerHTML = score;
        document.
        querySelector("#restart_menu").
        classList.remove("overlay_disabled");
      }
    }, 1000);

    spawn();

    loop();
  };

  const loop = timeStamp => {
    if (game_over) {
      return;
    }

    surface.cls();

    // FPS meter
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    fps = Math.round(1 / secondsPassed);

    if (
    room[0].emit_l.length === 0 &&
    room[0].emit_r.length === 0 &&
    vawe === true)
    {
      vawe = false;
      spawn();
    }

    room[0].bg_0.render(surface);

    room[0].bg_1.render(surface);
    room[0].bg_1.pinTo(
    new SAT.V(
    MG.Utils.clamp(
    room[0].cursor.vars.aim_pos.x,
    surface.w / 2 - 30,
    surface.w / 2 + 30),

    MG.Utils.clamp(
    room[0].cursor.vars.aim_pos.y,
    surface.h / 2 - 35,
    surface.h / 2 + 35)),


    0.01);


    render_emit("left");
    render_emit("right");

    for (let i = room[0].out.length - 1; i >= 0; i--) {
      room[0].out[i].sprite.render(room[0].out[i].collision, surface);
      room[0].out[i].syncPos(surface);

      if (room[0].out[i].collision.pos.y > surface.h + 10) {
        room[0].out.splice(i, 1);
      }
    }

    render_aim();

    for (let i = 1; i <= room[0].trail.length; i++) {
      room[0].trail[i - 1].render(surface, {
        hasFill: true,
        fillColor: "rgba(255, 255, 255, 0.75)" });


      MG.Utils.easePos(
      room[0].trail[i - 1].collision.pos,
      room[0].cursor.collision.pos,
      i * 0.005 + 0.05);

    }

    room[0].cursor.render(surface, {
      hasBorder: true,
      borderWidth: MG.Utils.u2p(0.3, surface),
      borderColor: "rgba(255, 255, 255, 0.5)" });


    render_info();

    if (
    room[0].cursor.collision.pos !==
    room[0].trail[room[0].trail.length - 1].collision.pos.x &&
    room[0].cursor.collision.pos.y !==
    room[0].trail[room[0].trail.length - 1].collision.pos.y)
    {
      check_collision("left");
      check_collision("right");
    }

    window.requestAnimationFrame(loop);
  };

  const resize_throttling = (() => {
    let alarm = 0;
    return (f, ms) => {
      clearTimeout(alarm);
      alarm = setTimeout(f, ms);
    };
  })();

  const spawn = (() => {
    let alarm = 0;
    return () => {
      clearTimeout(alarm);
      alarm = setTimeout(() => {
        switch (MG.Utils.weightedRandom(w_rand)) {
          case "left":
            emit_on_side("left");
            break;
          case "right":
            emit_on_side("right");
            break;
          case "both":
            emit_on_side("left");
            emit_on_side("right");
            break;}

        vawe = true;
      }, MG.Utils.randomInt(1000, 2000));
    };
  })();

  const emit_on_side = side => {
    let emit = side === "left" ? "emit_l" : "emit_r";

    for (let i = 0; i < MG.Utils.randomInt(2, 6); i++) {
      room[0][emit].push(
      new MG.Entity(
      "mc",
      new SAT.Polygon(surface.pos(side === "left" ? "bl" : "br"), [
      new SAT.V(),
      new SAT.V(6, 0),
      new SAT.V(6, 10),
      new SAT.V(0, 10)]),

      new MG.Particle(
      MG.Utils.randomRange(1.2, 1.9),
      MG.Utils.degToRad(
      side === "left" ?
      MG.Utils.randomRange(45, 65) * -1 :
      MG.Utils.randomRange(115, 135) * -1),

      { gravity: 0.005, friction: 0.99 }),

      new MG.Sprite({
        src:
        "https://raw.githubusercontent.com/elsemeow/cdn/main/img/cdpn/poLerLQ/card.png",
        ix: 0,
        iy: 0,
        sW: 180,
        sH: 248,
        dW: 8,
        dH: 12,
        frames: 11,
        speed: 15 })));



      room[0][emit][room[0][emit].length - 1].u2p(surface);
    }
  };

  const render_emit = side => {
    let emit = side === "left" ? "emit_l" : "emit_r";

    for (let i = room[0][emit].length - 1; i >= 0; i--) {
      room[0][emit][i].sprite.render(room[0][emit][i].collision, surface);
      room[0][emit][i].syncPos(surface);
      room[0][emit][i].collision.setAngle(
      room[0][emit][i].collision.angle +
      MG.Utils.degToRad(MG.Utils.randomRange(0.5, 1.5)));


      if (room[0][emit][i].collision.pos.y > surface.h + 10) {
        room[0][emit].splice(i, 1);
      }
    }
  };

  const check_collision = side => {
    let emit = side === "left" ? "emit_l" : "emit_r";

    for (let i = room[0][emit].length - 1; i >= 0; i--) {
      if (
      SAT.pointInPolygon(
      room[0].trail[0].collision.pos,
      room[0][emit][i].collision))

      {
        room[0][emit][i].sprite.iy = 1;
        room[0][emit][i].sprite.ixLast = 0;
        room[0][emit][i].sprite.frames = 4;
        room[0][emit][i].sprite.speed = 6;
        room[0].out.push(room[0][emit][i]);
        room[0][emit].splice(i, 1);
        combo++;
        score += 1 * combo;
      }
    }
  };

  const render_aim = () => {
    surface.ctx.lineWidth = MG.Utils.u2p(0.3, surface);
    surface.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    surface.ctx.fillStyle = "#ff8a85";

    surface.ctx.beginPath();
    surface.ctx.setLineDash([
    MG.Utils.u2p(3, surface),
    MG.Utils.u2p(1, surface)]);

    surface.ctx.moveTo(
    room[0].cursor.collision.pos.x,
    room[0].cursor.collision.pos.y);

    surface.ctx.lineTo(
    room[0].cursor.vars.aim_pos.x,
    room[0].cursor.vars.aim_pos.y);

    surface.ctx.stroke();
    surface.ctx.setLineDash([]);

    surface.ctx.fill(
    new Path2D(
    MG.Utils.circleToPath(
    room[0].cursor.vars.aim_pos,
    MG.Utils.u2p(1, surface))));



  };

  const render_info = () => {
    surface.ctx.fillStyle = "#fff";
    surface.ctx.font = "3.5vmin 'Quicksand'";
    surface.ctx.fillText(
    "×" + combo,
    room[0].cursor.collision.pos.x + MG.Utils.u2p(3, surface),
    room[0].cursor.collision.pos.y - MG.Utils.u2p(3, surface));


    surface.ctx.font = "3vmin 'Quicksand'";
    surface.ctx.fillText(
    "SCORE: " + score + "  TIME: " + time_left + "  FPS: " + fps,
    20,
    35);

  };

  window.onload = () => {
    document.querySelector("#start").addEventListener("click", event => {
      count_down = new Date().getTime() + 1000 * 60 * 1.5;
      game_over = false;

      init();

      document.querySelector("#start_menu").classList.add("overlay_disabled");
    });

    document.querySelector("#restart").addEventListener("click", event => {
      count_down = new Date().getTime() + 1000 * 60 * 1.5;
      game_over = false;
      vawe = false;
      score = 0;
      combo = 0;

      surface = {};
      room = [
      {
        bg_0: {},
        bg_1: {},
        out: [],
        emit_l: [],
        emit_r: [],
        trail: [],
        cursor: {} }];



      init();

      document.querySelector("#restart_menu").classList.add("overlay_disabled");
    });
  };
})();