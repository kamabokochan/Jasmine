class MMD_SETTING {
  constructor() {
    this.init();
  }

  async init() {
    // シーンの作成
    this.scene = new THREE.Scene();

    // 光の作成
    const ambient = new THREE.AmbientLight(0xeeeeee);
    this.scene.add(ambient);

    // 画面表示の設定
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xcccccc, 0);

    // documentにMMDをセットする
    document.body.appendChild(this.renderer.domElement);

    // カメラを作成 (視野角, 画面のアスペクト比, カメラに映る最短距離, カメラに映る最遠距離)
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(0, 18, 50);

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

    // モデルとモーションの読み込み準備
    var modelFile = "./static/pmx/zenitsu/zenitsu_taifuku.pmx";

    const loader = new THREE.MMDLoader();

    const onProgress = (xhr) => {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');
      }
    }

    const onError = (xhr) => {
      console.log("ERROR");
    }

    const LoadPMX = () => {
      return new Promise(resolve => {
        loader.load(modelFile, (object) => {
          this.mesh = object;
          this.scene.add(this.mesh);

          resolve(true);
        }, onProgress, onError);
      });
    }

    await LoadPMX();

    const Render = () => {
      requestAnimationFrame(Render);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }

    Render();
  }
}

new MMD_SETTING();