# MiMo 光圈

> 黑色光标 · 白色背景

## 导航栏
- **Logo**: ✦ MiMo
- **链接**: 功能 | 定价 | 关于

## 主标题
### MiMo 光圈
副标题：黑色光标 · 白色背景

## 交互特性
- **自定义光标**：黑色外环 + 中心点，跟随鼠标移动
- **悬停放大**：当鼠标悬停在导航栏或链接上时，光圈会放大（外环从 24px → 56px，中心点从 4px → 8px）
- **平滑跟随**：光标带有缓动效果，移动自然
- **离开窗口自动隐藏**：鼠标移出页面时光标消失，移入重新显示

## 底部信息
黑色环形光标 · 白色背景

---

## 原始 HTML 代码（供参考）
如果需要实现该页面，可直接使用以下 HTML（保存为 `.html` 文件在浏览器中打开）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>黑色光圈 · 白色背景</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            cursor: none;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #ffffff;
            color: #1a1a1a;
            overflow: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .navbar {
            position: fixed;
            top: 24px;
            left: 0;
            right: 0;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 5%;
            height: 64px;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            margin: 0 5%;
            border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .navbar .logo {
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(135deg, #7c5cfc, #4f8cf7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .nav-links {
            display: flex;
            gap: 32px;
            list-style: none;
            font-size: 15px;
            color: #333;
        }
        .nav-links a {
            color: inherit;
            text-decoration: none;
            transition: color 0.3s;
            padding: 6px 0;
            border-bottom: 2px solid transparent;
        }
        .nav-links a:hover {
            color: #7c5cfc;
            border-bottom-color: rgba(124, 92, 252, 0.5);
        }
        .hero-text {
            text-align: center;
            pointer-events: none;
            z-index: 5;
        }
        .hero-text h1 {
            font-size: clamp(2.8rem, 10vw, 6rem);
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #1a1a1a;
            text-shadow: 0 0 40px rgba(0, 0, 0, 0.05);
        }
        .hero-text h1 .highlight {
            background: linear-gradient(135deg, #7c5cfc, #4f8cf7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .hero-text p {
            font-size: clamp(1rem, 2vw, 1.6rem);
            color: #555;
            margin-top: 12px;
            opacity: 0.8;
        }
        #cursor-dot {
            position: fixed;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: transparent !important;
            border: 2px solid rgba(0, 0, 0, 0.9);
            pointer-events: none;
            z-index: 999;
            transform: translate(-50%, -50%);
            transition: width 0.3s ease, height 0.3s ease,
                        border-width 0.3s ease, border-color 0.3s ease;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.08);
            will-change: transform;
        }
        #cursor-dot::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 4px;
            background: rgba(0, 0, 0, 0.95);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.3s ease, height 0.3s ease, background 0.3s ease;
        }
        #cursor-dot.hover-nav {
            width: 56px;
            height: 56px;
            border-width: 3px;
            border-color: rgba(0, 0, 0, 0.8);
            box-shadow: 0 0 60px rgba(0, 0, 0, 0.15);
        }
        #cursor-dot.hover-nav::after {
            width: 8px;
            height: 8px;
            background: rgba(0, 0, 0, 1);
        }
        .credit {
            position: fixed;
            bottom: 30px;
            right: 40px;
            z-index: 5;
            font-size: 13px;
            color: #999;
            pointer-events: none;
            letter-spacing: 0.5px;
        }
        @media (max-width: 768px) {
            .navbar {
                margin: 0 3%;
                padding: 0 4%;
                height: 56px;
                top: 16px;
            }
            .nav-links {
                gap: 16px;
                font-size: 13px;
            }
        }
        @media (pointer: coarse) {
            #cursor-dot {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar" id="navbar">
        <span class="logo">✦ MiMo</span>
        <ul class="nav-links">
            <li><a href="#">功能</a></li>
            <li><a href="#">定价</a></li>
            <li><a href="#">关于</a></li>
        </ul>
    </nav>
    <div class="hero-text">
        <h1><span class="highlight">MiMo</span> 光圈</h1>
        <p>黑色光标 · 白色背景</p>
    </div>
    <div id="cursor-dot"></div>
    <div class="credit">黑色环形光标 · 白色背景</div>
    <script>
        const cursorDot = document.getElementById('cursor-dot');
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-links a, .navbar .logo');
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        function updateCursor() {
            currentX += (mouseX - currentX) * 0.2;
            currentY += (mouseY - currentY) * 0.2;
            cursorDot.style.left = currentX + 'px';
            cursorDot.style.top = currentY + 'px';
            requestAnimationFrame(updateCursor);
        }
        updateCursor();
        const hoverElements = [navbar, ...navLinks];
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hover-nav');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hover-nav');
            });
        });
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
        });
    </script>
</body>
</html>