const container = document.querySelector('.container');
const face = document.querySelector('.face-slider');
const btnHappy = document.querySelector('.button-happy');
const btnUnhappy = document.querySelector('.button-unhappy');
const title = document.querySelector('.title');
const subtitle = document.querySelector('.subtitle');
const heartsContainer = document.querySelector('.floating-hearts');

const config = {
    // 这里修改卸载点击的最大次数,如果为0或1就是不会乱跑
    maxUnhappyCount: 1,
    // 这里修改动画速度
    animationSpeed: 0.1,
    // 这里修改文字，正常状态下在html文件里面修改
    states: {
        normal: {
            face: { happiness: 0.9, derp: 1, px: 0.5, py: 0.5 },
            ui: {
                btnHappyText: btnHappy.innerHTML,
                btnUnhappyText: btnUnhappy.innerHTML,
                titleText: title.innerHTML,
                subtitleText: subtitle.innerHTML
            }
        },
        happy: {
            face: { happiness: 1, derp: 0, px: 0.5, py: 0.5 },
            ui: {
                btnHappyText: '❤️ 我也爱你',
                btnUnhappyText: '❤️ 我也爱你',
                titleText: '❤️ 我们在一起啦 ❤️',
                subtitleText: '愿我们的爱情，如繁星般璀璨，如大海般深邃'
            }
        },
        unhappy: {
            face: { happiness: 0.2, derp: 0, px: 0.5, py: 0.5 },
            ui: {
                btnHappyText: '再给我一次机会',
                btnUnhappyText: '再给我一次机会',
                titleText: '💔 我会等你 💔',
                subtitleText: '爱情需要时间，我愿意等待你的答案'
            }
        }
    }
};

// 创建浮动爱心
function createFloatingHearts() {
    const heartSymbols = ['❤️', '💖', '💕', '💓', '💗', '💘', '💝'];
    
    // 初始创建一些爱心
    for (let i = 0; i < 15; i++) {
        createHeart();
    }
    
    // 每隔一段时间创建新的爱心
    setInterval(createHeart, 2000);
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        
        // 随机位置和大小
        const size = Math.random() * 2 + 1; // 1-3倍大小
        const left = Math.random() * 100; // 0-100%
        const animationDuration = Math.random() * 10 + 10; // 10-20秒
        
        heart.style.left = `${left}%`;
        heart.style.fontSize = `${size}em`;
        heart.style.animationDuration = `${animationDuration}s`;
        
        heartsContainer.appendChild(heart);
        
        // 动画结束后移除元素
        setTimeout(() => {
            heart.remove();
        }, animationDuration * 1000);
    }
}

// 页面加载时创建浮动爱心
createFloatingHearts();

const state = {
    rejectCount: 0,
    animationId: null,
    current: { ...config.states.normal.face },
    target: { ...config.states.normal.face }
}

function updateFaceCSS() {
    Object.entries(state.current).forEach(([prop, value]) => {
        face.style.setProperty(`--${prop}`, value)
    })
}

function transitionToState(stateType, hideButton = null) {
    const targetState = config.states[stateType]
    Object.assign(state.current, targetState.face)
    btnHappy.innerHTML = targetState.ui.btnHappyText
    btnUnhappy.innerHTML = targetState.ui.btnUnhappyText
    title.innerHTML = targetState.ui.titleText
    subtitle.innerHTML = targetState.ui.subtitleText
    if (hideButton) {
        hideButton.style.visibility = 'hidden'
        btnUnhappy.style.position = 'static'
        btnUnhappy.style.left = ''
        btnUnhappy.style.top = ''
        btnHappy.style.transform = 'scale(1)'
    } else {
        btnHappy.style.visibility = 'visible'
        btnUnhappy.style.visibility = 'visible'
    }
    updateFaceCSS()
}

function stopAnimation() {
    if (state.animationId) {
        cancelAnimationFrame(state.animationId)
        state.animationId = null
    }
}

function startAnimation() {
    function updateFace() {
        for (const prop in state.target) {
            if (state.target[prop] === state.current[prop]) continue

            needsUpdate = true
            if (Math.abs(state.target[prop] - state.current[prop]) < 0.01) {
                state.current[prop] = state.target[prop]
            } else {
                state.current[prop] += (state.target[prop] - state.current[prop]) * config.animationSpeed
            }
        }
        updateFaceCSS()
        state.animationId = requestAnimationFrame(updateFace)
    }
    updateFace()
}

container.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
    const unhappyRect = btnUnhappy.getBoundingClientRect()
    const happyRect = btnHappy.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const dx1 = x - (unhappyRect.x + unhappyRect.width * 0.5)
    const dy1 = y - (unhappyRect.y + unhappyRect.height * 0.5)
    const dx2 = x - (happyRect.x + happyRect.width * 0.5)
    const dy2 = y - (happyRect.y + happyRect.height * 0.5)

    const px = (x - containerRect.x) / containerRect.width
    const py = (y - containerRect.y) / containerRect.height

    const distUnhappy = Math.sqrt(dx1 * dx1 + dy1 * dy1)
    const distHappy = Math.sqrt(dx2 * dx2 + dy2 * dy2)
    const happiness = Math.pow(distUnhappy / (distHappy + distUnhappy), 0.75)

    state.target = { ...state.target, happiness, derp: 0, px, py }
})

container.addEventListener('mouseleave', () => {
    state.target = { ...config.states.normal.face }
})

btnHappy.addEventListener('click', () => {
    if (state.animationId) {
        btnHappy.style.transform = 'scale(1)';
        stopAnimation();
        transitionToState('happy', btnUnhappy);
        
        // 点击接受时，创建爱心爆炸效果
        createHeartExplosion();
        
        // 播放音乐（如果需要）
        playLoveMusic();
    } else {
        state.rejectCount = 0;
        transitionToState('normal');
        startAnimation();
    }
});

btnUnhappy.addEventListener('click', () => {
    if (state.animationId) {
        state.rejectCount++;

        if (state.rejectCount >= config.maxUnhappyCount) {
            stopAnimation();
            transitionToState('unhappy', btnHappy);
        } else {
            // 拒绝按钮逃跑效果
            btnUnhappy.style.position = 'absolute';
            btnUnhappy.style.left = `${Math.random() * 80}%`;
            btnUnhappy.style.top = `${Math.random() * 80}%`;
            state.target.happiness = Math.max(0.1, state.target.happiness - 0.1);
            
            // 接受按钮变大效果
            btnHappy.style.transform = `scale(${1 + state.rejectCount * 0.1})`;
            
            // 每次拒绝时改变副标题
            const rejectMessages = [
                "真的不再考虑一下吗？",
                "你确定吗？再看看我嘛~",
                "别这样，给我一次机会",
                "我会很难过的...",
                "你是我的唯一啊",
                "没有你，我的世界将失去色彩",
                "我保证会好好珍惜你的",
                "你忍心拒绝这么可爱的我吗？"
            ];
            
            if (state.rejectCount <= rejectMessages.length) {
                subtitle.innerHTML = rejectMessages[state.rejectCount - 1];
            }
        }
    } else {
        state.rejectCount = 0;
        transitionToState('normal');
        startAnimation();
    }
});

// 创建爱心爆炸效果
function createHeartExplosion() {
    for (let i = 0; i < 50; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = '❤️';
        
        const size = Math.random() * 2 + 1;
        const left = 50 + (Math.random() - 0.5) * 100;
        const top = 50 + (Math.random() - 0.5) * 100;
        
        heart.style.position = 'absolute';
        heart.style.left = `${left}%`;
        heart.style.top = `${top}%`;
        heart.style.fontSize = `${size}em`;
        heart.style.animation = `none`;
        heart.style.transform = 'scale(0)';
        
        heartsContainer.appendChild(heart);
        
        // 使用动画API创建爆炸效果
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 20;
        const duration = Math.random() * 1000 + 1000;
        
        heart.animate([
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1, offset: 0.1 },
            { 
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'ease-out',
            fill: 'forwards'
        }).onfinish = () => heart.remove();
    }
}

// 播放爱情音乐（如果需要）
function playLoveMusic() {
    // 如果需要播放音乐，可以在这里添加代码
    // 注意：现代浏览器通常需要用户交互才能自动播放音频
    /*
    const audio = new Audio('https://example.com/love-song.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('无法自动播放音频:', e));
    */
}

startAnimation()
