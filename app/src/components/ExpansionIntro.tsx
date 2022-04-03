// @ts-nocheck
import { defineComponent, Teleport } from "vue";

export const ExpansionIntro = defineComponent({
  name: "ExpansionIntro",
  data() {
    return {
      div: <div>hello</div>,
      isUnmounted: false,
      textIsVisible: false,
      isHidden: false,
    };
  },
  beforeUnmount() {
    this.isUnmounted = true;
  },
  render() {
    return this.isHidden ? null : (
      <Teleport to="body">
        <div
          id="expansionintrocontainer"
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100000,
            background: "black",
          }}
        ></div>
        <div
          style={{
            zIndex: 10000000,
            width: "100vw",
            height: "100vh",
            opacity: this.textIsVisible ? 1 : 0,
          }}
          class={`fixed inset-0 z-[100000000] flex flex-col items-center justify-center overflow-hidden text-white transition-all duration-500 `}
        >
          <span
            style={{ fontSize: "1.5rem", fontWeight: "100", lineHeight: 1 }}
          >
            Sif's
          </span>
          <span
            style={{
              textShadow: `0 0 10px #c1a04f, 0 0 20px #c1a04f, 0 0 30px #c1a04f, 0 0 40px #c1a04f, 0 0 70px #c1a04f, 0 0 80px #c1a04f, 0 0 100px #c1a04f, 0 0 150px #c1a04f`,
              fontSize: `6rem`,
              fontWeight: 100,
            }}
            class="font-light uppercase"
          >
            Expansion
          </span>
          <span
            style={{
              textTransform: "uppercase",
              fontWeight: 200,
              fontSize: "1rem",
              letterSpacing: "1.5px",
            }}
          >
            100% APR on All Pools. 300% APR On Bonus Pools.
          </span>
          <div
            style={{
              textTransform: "uppercase",
              fontWeight: 200,
              fontSize: "1rem",
              opacity: 0.6,
              letterSpacing: "1.5px",
              cursor: "pointer",
            }}
            onClick={() => {
              this.isHidden = true;
            }}
          >
            <br />
            ENTER THE DEX
          </div>
        </div>
      </Teleport>
    );
  },
  async mounted() {
    const unmountedPredicate = () => this.isUnmounted;
    const getContainer = () =>
      document.getElementById("expansionintrocontainer");
    await new Promise((resolve, reject) => {
      const scriptEl = document.createElement("script");
      scriptEl.src =
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/100/three.min.js";
      scriptEl.onload = resolve;
      scriptEl.onerror = reject;
      document.head.appendChild(scriptEl);
    });
    setTimeout(() => {
      this.textIsVisible = true;
    }, 6000);
    // stats.js - http://github.com/mrdoob/stats.js
    var Stats = function () {
      function h(a) {
        c.appendChild(a.dom);
        return a;
      }
      function k(a) {
        for (var d = 0; d < c.children.length; d++)
          c.children[d].style.display = d === a ? "block" : "none";
        l = a;
      }
      var l = 0,
        c = document.createElement("div");
      c.className = "expansionintro";
      c.style.cssText =
        "position:fixed;top:0;left:0;right:0;bottom:0;height:100vh;width:100vw;overflow:hidden;cursor:pointer;opacity:0.9;z-index:100000;background:black;";
      c.addEventListener(
        "click",
        function (a) {
          a.preventDefault();
          k(++l % c.children.length);
        },
        !1,
      );
      var g = (performance || Date).now(),
        e = g,
        a = 0,
        r = h(new Stats.Panel("FPS", "#0ff", "#002")),
        f = h(new Stats.Panel("MS", "#0f0", "#020"));
      if (self.performance && self.performance.memory)
        var t = h(new Stats.Panel("MB", "#f08", "#201"));
      k(0);
      return {
        REVISION: 16,
        dom: c,
        addPanel: h,
        showPanel: k,
        begin: function () {
          g = (performance || Date).now();
        },
        end: function () {
          a++;
          var c = (performance || Date).now();
          f.update(c - g, 200);
          if (
            c > e + 1e3 &&
            (r.update((1e3 * a) / (c - e), 100), (e = c), (a = 0), t)
          ) {
            var d = performance.memory;
            t.update(d.usedJSHeapSize / 1048576, d.jsHeapSizeLimit / 1048576);
          }
          return c;
        },
        update: function () {
          g = this.end();
        },
        domElement: c,
        setMode: k,
      };
    };
    Stats.Panel = function (h, k, l) {
      var c = Infinity,
        g = 0,
        e = Math.round,
        a = e(window.devicePixelRatio || 1),
        r = 80 * a,
        f = 48 * a,
        t = 3 * a,
        u = 2 * a,
        d = 3 * a,
        m = 15 * a,
        n = 74 * a,
        p = 30 * a,
        q = document.createElement("canvas");
      q.width = r;
      q.height = f;
      q.style.cssText = "width:80px;height:48px";
      var b = q.getContext("2d");
      b.font = "bold " + 9 * a + "px Helvetica,Arial,sans-serif";
      b.textBaseline = "top";
      b.fillStyle = l;
      b.fillRect(0, 0, r, f);
      b.fillStyle = k;
      b.fillText(h, t, u);
      b.fillRect(d, m, n, p);
      b.fillStyle = l;
      b.globalAlpha = 0.9;
      b.fillRect(d, m, n, p);
      return {
        dom: q,
        update: function (f, v) {
          c = Math.min(c, f);
          g = Math.max(g, f);
          b.fillStyle = l;
          b.globalAlpha = 1;
          b.fillRect(0, 0, r, m);
          b.fillStyle = k;
          b.fillText(e(f) + " " + h + " (" + e(c) + "-" + e(g) + ")", t, u);
          b.drawImage(q, d + a, m, n - a, p, d, m, n - a, p);
          b.fillRect(d + n - a, m, a, p);
          b.fillStyle = l;
          b.globalAlpha = 0.9;
          b.fillRect(d + n - a, m, a, e((1 - f / v) * p));
        },
      };
    };
    "object" === typeof module && (module.exports = Stats);
    // stats.min.js END
    //-----------------------------------------------------------
    // WebGL Begins
    var WEBGL = {
      isWebGLAvailable: function () {
        try {
          var e = document.createElement("canvas");
          return !(
            !window.WebGLRenderingContext ||
            (!e.getContext("webgl") && !e.getContext("experimental-webgl"))
          );
        } catch (e) {
          return !1;
        }
      },
      isWebGL2Available: function () {
        try {
          var e = document.createElement("canvas");
          return !(!window.WebGL2RenderingContext || !e.getContext("webgl2"));
        } catch (e) {
          return !1;
        }
      },
      getWebGLErrorMessage: function () {
        return this.getErrorMessage(1);
      },
      getWebGL2ErrorMessage: function () {
        return this.getErrorMessage(2);
      },
      getErrorMessage: function (e) {
        var t = {
            1: window.WebGLRenderingContext,
            2: window.WebGL2RenderingContext,
          },
          n =
            'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>',
          r = document.createElement("div");
        return (
          (r.id = "webglmessage"),
          (r.style.fontFamily = "monospace"),
          (r.style.fontSize = "13px"),
          (r.style.fontWeight = "normal"),
          (r.style.textAlign = "center"),
          (r.style.background = "#fff"),
          (r.style.color = "#000"),
          (r.style.padding = "1.5em"),
          (r.style.width = "400px"),
          (r.style.margin = "5em auto 0"),
          (n = (n = t[e]
            ? n.replace("$0", "graphics card")
            : n.replace("$0", "browser")).replace(
            "$1",
            { 1: "WebGL", 2: "WebGL 2" }[e],
          )),
          (r.innerHTML = n),
          r
        );
      },
    };
    // WebGL.js END
    //----------------------------------------------------
    // My Code

    if (WEBGL.isWebGLAvailable() === false) {
      getContainer().appendChild(WEBGL.getWebGLErrorMessage());
    }

    var SCREEN_WIDTH = window.innerWidth,
      SCREEN_HEIGHT = window.innerHeight,
      r = 450,
      mouseY = 0,
      windowHalfY = window.innerHeight / 2,
      camera,
      scene,
      renderer;

    init();
    animate();

    function init() {
      camera = new THREE.PerspectiveCamera(
        80,
        SCREEN_WIDTH / SCREEN_HEIGHT,
        1,
        3000,
      );
      camera.position.z = 1000;

      scene = new THREE.Scene();

      const colorA = 0xf2a600;
      const colorB = 0xffc200;
      var i,
        line,
        material,
        p,
        parameters = [
          [0.1, colorB, /* Done */ 0.1],
          [0.1, colorA, 0.1],
          [0.1, colorB /* Done */, 0.1],
          [0.1, colorA, 0.1],
          [0.1, colorB /* Done */, 0.1],
          [0.1, colorA, 0.1],
          [0.1, colorB /* Done */, 0.1],
          [0.1, colorA, 0.1],
          [0.1, colorB /* Done */, 0.1],
        ];

      var geometry = createGeometry();

      for (i = 0; i < parameters.length; ++i) {
        p = parameters[i];

        material = new THREE.LineBasicMaterial({
          color: p[1],
          opacity: p[2],
        });

        line = new THREE.LineSegments(geometry, material);
        line.scale.x = line.scale.y = line.scale.z = p[0]++;
        line.userData.originalScale = p[0];
        line.rotation.y = Math.random() * Math.PI;
        line.updateMatrix();
        scene.add(line);
      }

      renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      getContainer().appendChild(renderer.domElement);

      document.addEventListener("mousemove", onDocumentMouseMove, false);
      document.addEventListener("touchstart", onDocumentTouchStart, false);
      document.addEventListener("touchmove", onDocumentTouchMove, false);

      window.addEventListener("resize", onWindowResize, false);

      // test geometry swapability
      setInterval(function () {
        var geometry = createGeometry();
        scene.traverse(function (object) {
          if (object.isLine) {
            object.geometry.dispose();
            object.geometry = geometry;
          }
        });
      }, 100000); // This was making the code go stuck
    }

    function createGeometry() {
      var geometry = new THREE.BufferGeometry();
      var vertices = [];

      var vertex = new THREE.Vector3();

      for (var i = 0; i < 1500; i++) {
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.normalize();
        vertex.multiplyScalar(r);

        vertices.push(vertex.x, vertex.y, vertex.z);

        vertex.multiplyScalar(Math.random() * 0.01 + 1);

        vertices.push(vertex.x, vertex.y, vertex.z);
      }
      geometry.addAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
      );

      return geometry;
    }

    function onWindowResize() {
      windowHalfY = window.innerHeight / 2;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onDocumentMouseMove(event) {
      mouseY = event.clientY - windowHalfY;
    }

    function onDocumentTouchStart(event) {
      if (event.touches.length > 1) {
        event.preventDefault();

        mouseY = event.touches[0].pageY - windowHalfY;
      }
    }

    function onDocumentTouchMove(event) {
      if (event.touches.length == 1) {
        event.preventDefault();
        mouseY = event.touches[0].pageY - windowHalfY;
      }
    }

    function animate() {
      if (unmountedPredicate()) return;
      requestAnimationFrame(animate);
      render();
    }
    //
    var rpmY = 7;
    var rpmX = 9;
    var initTime = Date.now();
    function render() {
      renderer.render(scene, camera);

      const START_TIME_STATE = 1637813565395;
      const timestamp = (START_TIME_STATE + (Date.now() - initTime)) * 0.00005;
      var time = timestamp;

      for (var i = 0; i < scene.children.length; i += 1) {
        var object = scene.children[i];
        if (object.isLine) {
          object.rotation.y = rpmY * (time * (i < 4 ? i + 1 : -(i + 1)));
          object.rotation.x = rpmX * (time * (i < 4 ? i + 1 : -(i + 1)));
          if (i < 9) {
            var scale =
              object.userData.originalScale *
              (i / 5 + 0.1) *
              (1 + 20 * Math.sin(2 * time));
            object.scale.x = object.scale.y = object.scale.z = scale;
          }
        }
      }
    }
  },
});
