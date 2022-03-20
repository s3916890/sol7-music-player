/**
 * 1. Render các bài hát
 * 2. Scroll top
 * 3. Play / Pause / Seek
 * 4. CD Rotate (Animation đĩa quay tròn)
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat khi kết thúc bài hát
 * 8. Active bài nhạc (tức là thanh active màu đỏ)
 * 9. Khi chuyển qua bài mới thì tự động scroll lên / xuống
 * 10. Phát nhạc khi bấm vào
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const playlist = $('.playlist');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const audio = $('#audio');
const player = $('.player');
const progress = $('#progress');
const heading = $('header h2');
const cdThumb = $('.cd .cd-thumb');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const cdInner = $('.cd-inner');

const app = {
    currentIndex : 0,
    isPlaying : false,
    isNext : false,
    isPrev : false,
    isRandom : false,
    isRepeat : false,
    // Parse : chuyển kiểu dữ liệu từ JSON(string) sang kiểu dữ liệu JS
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    // Check database của các nút trên application của DEVTOOLS 
    setConfig : function(key, value){
        this.config[key] = value;
        // localStorage chỉ lưu string nên phải stringify nó ra rồi kết quả đó sẽ 
        // đưa vào hàm config để parse ra kiểu dữ liệu JavaScript
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name : 'Young Goku',
            singer : 'Sol7, DCOD, Mvdbeez',
            path : './assets/music/younggoku.mp3',
            image : 'https://i1.sndcdn.com/artworks-000412945263-pravj9-t500x500.jpg'
        },
        {
            name : 'Loner',
            singer : 'Sol7, DCOD, Dope B',
            path : './assets/music/loner.mp3',
            image : 'https://i1.sndcdn.com/artworks-000412945263-pravj9-t500x500.jpg'
        },
        {
            name : 'Traplife',
            singer : 'Sol7, DCOD, P$mall',
            path : './assets/music/traplife.mp3',
            image : 'https://i1.sndcdn.com/artworks-000412945263-pravj9-t500x500.jpg'
        },
        {
            name : 'Icy Heart',
            singer : 'Sol7, DCOD',
            path : './assets/music/IcyHeart.mp3',
            image : 'https://i1.sndcdn.com/artworks-000412945263-pravj9-t500x500.jpg'
        },
        {
            name : 'Vlone',
            singer : 'Sol7, DCOD',
            path : './assets/music/Vlone.mp3',
            image : 'https://i1.sndcdn.com/artworks-000412945263-pravj9-t500x500.jpg'
        },
        {
            name : 'Aspirin',
            singer : 'Sol7, DCOD, Yuno',
            path : './assets/music/aspirin.mp3',
            image : 'https://i1.sndcdn.com/artworks-000412945263-pravj9-t500x500.jpg'
        },
    ],
    // Define properties để trang web bắt đầu từ bài hát đầu tiên bằng curentIndex = 0
    defineProperties : function(){
        /**
         * @param currentSong : an OBJECT of @param app
         */
        Object.defineProperty(this, 'currentSong', {
            // Xài hàm get để trả về bài hát đầu tiên 
            get:function(){
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function(){
        const __this__ = this;
        const cdWidth = cd.offsetWidth;
        
        // 4. Xử lí đĩa CD quay / dừng 
        const cdThumbAnimate = cdThumb.animate(
            [
                {
                    transform : 'rotate(360deg)'
                }
            ],
            {
                duration : 10000,
                iterations : Infinity
            }
        );

        cdThumbAnimate.pause();

        // 1. Xử lí phóng to / thu nhỏ CD
        document.onscroll = function(){
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            // Scroll chỗ nào thì lấy width trừ bù cho px đã scroll
            const newCdWidth = cdWidth - scrollY;
            // console.log(scrollY)
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            // Công thức tính Opacity = newCdWidth / cdWidth
            cd.style.opacity = newCdWidth / cdWidth;
            // console.log(scrollY); (truc Y bat dau tu 0)
            // console.log(newCdWidth); (width giam dan`)
        }

        playBtn.onclick = function(){
            // nếu xài this thì nó sẽ trỏ tới playBtn. Vì vậy 
            // khai báo __this__ = this để có thể xài trong những phương thức khác
            if (__this__.isPlaying){
                audio.pause();
            }
            else{
                audio.play();
            }
        }
        // Các thao tác xử lí bên audio 
        // Khi audio bấm phát nhạc thì nút pause (.playing được thêm vào)
        audio.onplay = function(){
            __this__.isPlaying = true;
            // xài cú pháp này khi add class vào (bấm nút play/pause)
            player.classList.add('playing')
            cdInner.classList.add('active');
            $('.song.active .spectrum').classList.remove('paused');
            $('.song.active .spectrum').classList.add('active');
            // Khi bài nhạc được phát, thì animation của cdThumb sẽ chạy
            cdThumbAnimate.play()
        }
        audio.onpause = function(){
            __this__.isPlaying = false;
            player.classList.remove('playing');
            cdInner.classList.remove('active');
            $('.song.active .spectrum').classList.add('paused');
            $('.song.active .spectrum').classList.remove('active');
            // Khi bài nhạc stop, thì animation của cdThumb sẽ stop
            cdThumbAnimate.pause();
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if (audio.duration){
                const progressPercentage = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercentage;
                // console.log(progress.value);
            }
        }
        // Xử lí khi tua bài nhạc
        progress.onchange = function(){
            const seekTime = (audio.duration / 100 * this.value);
            // gắn giá trị cho currentTime
            audio.currentTime = seekTime;
            // console.log(audio.currentTime);
            // console.log(seekTime);
        }
        // Bấm tua bài hát
        nextBtn.onclick = function(){
            if (__this__.isRandom || __this__.isRandom === true){
                __this__.playRandomSong();
            }
            else{
                __this__.nextSong();
            }
            audio.play();
            // Khi bấm chuyển sang bài hát kế tiếp thì thẻ div của mỗi bài sẽ ACTIVE
            __this__.render()

            // Khi chuyển bài thì trình duyệt sẽ tự scroll animation theo vị trí của bài hát
            setTimeout(() => {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            }, 300)
        }
        prevBtn.onclick = function(){
            if (__this__.isRandom || __this__.isRandom === true){
                __this__.playRandomSong();
            }
            else{
                __this__.prevSong();
            }
            audio.play();
            // Khi bấm chuyển sang bài hát trước đó thì thẻ div của mỗi bài sẽ ACTIVE
            __this__.render()

            // Khi chuyển bài thì trình duyệt sẽ tự scroll animation theo vị trí của bài hát
            setTimeout(() => {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            }, 300)
        }
        // Nút random bài hát
        randomBtn.onclick = function(){
            __this__.isRandom = !__this__.isRandom;
            // Check database của nút random trên application của dev tools 
            __this__.setConfig('isRandom', __this__.isRandom);
            randomBtn.classList.toggle('active', __this__.isRandom);
        }

        // Khi bài hát kết thúc thì sẽ REPEAT
        repeatBtn.onclick = function(){
            __this__.isRepeat = !__this__.isRepeat;
            // Check database của nút random trên application của dev tools 
            __this__.setConfig('isRepeat', __this__.isRepeat);
            repeatBtn.classList.toggle('active', __this__.isRepeat);
        }

        audio.onended = function(){
            if (__this__.isRepeat || __this__.isRepeat === true){
                __this__.playRepeatSong();
            }
            else{
                // onclick : người dùng click vào
                // click : nó tự click
                nextBtn.click();
            }
        }
        // khi click vào bài hát trong playlist 
        playlist.onclick = function(event){
            // ta sẽ sử dụng phương thức closest để check xem mình có click vào playlist ko ?
            const songElement = event.target.closest('.song:not(.active)');

            if (songElement || event.target.closest('.option')){
                if (songElement){
                    // HTMLElement.dataset.testValue (data-testValue = {index})
                    // Dataset sẽ trả về String vì nó là DOMSringMap
                    __this__.currentIndex = Number(songElement.dataset.index);
                    __this__.loadCurrentSong();
                    __this__.render()
                    audio.play();
                }
            }
        }
    },
    // Hàm để load và chạy bài hát
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url("https://i1.sndcdn.com/artworks-000412945263-pravj9-t500x500.jpg")`;
        audio.src = this.currentSong.path;
    },
    render: function(){
        const htmls = this.songs.map((song, index) => {
            // We will apply data-testValue
            return ` <div class="song ${index === this.currentIndex ? 'active' : '' }" data-index = "${index}">
                    <div class="thumb" style="background-image: url('${song.image}');">
                    </div>
                    <div class="body">
                        <div class="title">${song.name}</div>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                    <div class = "spectrum">
                        <div class = "mini-spectrum"></div>
                    </div>
                </div>`
        })

        $('.playlist').innerHTML = htmls.join('');
    },
    getCurrentSong : function(){
        return this.songs[this.currentIndex];
    },
    nextSong : function(){
        this.currentIndex++;
        // Khi bấm next qua luôn bài hát cuối, thì nó sẽ quay lại từ đầu
        if (this.currentIndex > this.songs.length - 1){
            this.currentIndex = 0
        }
        // Khi index đã thay đổi, thì ta phải load bài hát bằng hàm loadCurrentSong()
        this.loadCurrentSong();
    },
    prevSong: function(){
        this.currentIndex--;
        if (this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong : function(){
        let newIndex; 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);    
        }while(newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong()
    },
    playRepeatSong : function(){
        audio.play();
    },
    run: function(){
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
    }
}

app.run();
