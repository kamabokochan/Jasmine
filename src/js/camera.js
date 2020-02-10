class MMD_SETTING {
  constructor() {
    this.init();
  }

  async init() {
    // シーンの作成
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.setLight();
    this.setDisplay();
    this.setCamera();
    this.bindEvent();
    this.loader = new THREE.MMDLoader();
    await this.LoadPMX();
    await this.LoadStage();
    this.vmd = await this.LoadVMD();
    this.helper = new THREE.MMDAnimationHelper();

    this.helper.add(this.mesh, {
      animation: this.vmd,
      physics: false
    });

    this.cameraAnimation = await this.LoadCamera();

    this.helper.add(this.camera, {
      animation: this.cameraAnimation
    });

    const mixer = this.helper.objects.get(this.mesh).mixer;
    // mixer.existingAction(this.vmd).setLoop(THREE.LoopOnce);
    // console.log(mixer)
    var waveAction = mixer.clipAction(this.vmd);
    console.log(waveAction)

    // document.getElementById('play').addEventListener('click', () => waveAction.enabled = true);
    // document.getElementById('pause').addEventListener('click', () => waveAction.enabled = false);
    // // VMD Loop Event
    // mixer.addEventListener("loop", (event) => {
    //   console.log("loop");
    // });

    // // VMD Loop Once Event
    // mixer.addEventListener("finished", (event) => {
    //   console.log("finished");
    // });
    // documentにMMDをセットする
    document.body.appendChild(this.renderer.domElement);
    this.Render();
  }

  setLight() {
    // 光の作成
    const ambient = new THREE.AmbientLight(0xeeeeee);
    this.scene.add(ambient);
  }

  setDisplay() {
    // 画面表示の設定
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xcccccc, 0);
  }

  setCamera() {
    // カメラを作成 (視野角, 画面のアスペクト比, カメラに映る最短距離, カメラに映る最遠距離)
    this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(0, 10, 50);

    // カメラコントローラーを作成
    const controls = new THREE.OrbitControls(this.camera);

    // 滑らかにカメラコントローラーを制御する
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    // 毎フレーム時に実行されるループイベントです
    const tick = () => {
      // カメラコントローラーを更新
      controls.update();

      // レンダリング
      this.renderer.render(this.scene, this.camera);

      requestAnimationFrame(tick);
    }

    tick();
  }

  bindEvent() {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    // https://ics.media/tutorial-three/renderer_resize/
    // レンダラーのサイズを調整する
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // カメラのアスペクト比を正す
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  LoadPMX() {
    // モデルとモーションの読み込み準備
    const models = [
      {
        path: "../pmx/zenitsu/zenitsu_taifuku.pmx"
      },
      {
        path: "../pmx/zenitsu/zenitsu_haori.pmx"
      }
    ]

    var modelFile = models[1].path;

    return new Promise(resolve => {
      this.loader.load(modelFile, (object) => {
        this.mesh = object;
        this.mesh.position.y = -10;
        this.scene.add(this.mesh);
        resolve(true);
      }, this.onProgress, this.onError);
    });
  }

  LoadStage() {
    const stage = '../pmx/冴木稲荷神社 ver1.10/models/《単独使用》冴木稲荷神社■春■.pmx';

    return new Promise(resolve => {
      this.loader.load(stage, (object) => {
        object.position.y = -10;
        this.scene.add(object);
        resolve(true);
      }, this.onProgress, this.onError);
    });
  }

  LoadVMD() {
    const path = '../vmd/motion/極楽上半身ボーンが長い用.vmd';

    return new Promise(resolve => {
      this.loader.loadAnimation(path, this.mesh, (vmd) => {
        resolve(vmd);
      }, this.onProgress, this.onError);
    })
  }

  LoadCamera() {
    const path = '../vmd/camera/極楽浄土＿カメラ表情/カメラ（けみか式で調整）.vmd';

    return new Promise(resolve => {
      this.loader.loadAnimation(path, this.camera, (vmd) => {
        resolve(vmd);
      }, this.onProgress, this.onError);
    })
  }

  onProgress(xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  }

  onError(xhr) {
    console.log("ERROR");
  }

  Render() {
    requestAnimationFrame(() => this.Render());
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.helper.update(this.clock.getDelta());
  }
}

new MMD_SETTING();