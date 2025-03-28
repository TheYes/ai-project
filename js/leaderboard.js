class ScoreHistory {
    constructor() {
        this.storageKey = 'game2048_history';
        this.maxEntries = 10;  // 保存最近10次得分
        this.deviceId = this.getDeviceId();
        this.historyElement = null;
        this.bestScore = 0;
        this.loadBestScore();
        this.initializeUI();
    }

    // 生成设备唯一标识
    getDeviceId() {
        const storedId = localStorage.getItem('game2048_device_id');
        if (storedId) return storedId;

        const features = [
            navigator.userAgent,
            navigator.language,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset()
        ].join('|');

        const deviceId = btoa(features).slice(0, 32);
        localStorage.setItem('game2048_device_id', deviceId);
        return deviceId;
    }

    loadBestScore() {
        const history = this.getHistory();
        if (history.length > 0) {
            this.bestScore = Math.max(...history.map(entry => entry.score));
        }
    }

    // 初始化UI
    initializeUI() {
        /* const container = document.createElement('div');
        container.className = 'leaderboard-container';
        container.innerHTML = `
            <h2>历史得分</h2>
            <div class="best-score">最高分: <span>0</span></div>
            <div class="score-trend"></div>
            <div class="leaderboard-list"></div>
            <div class="share-section">
                <button class="share-button" onclick="window.shareScore()">分享我的成绩</button>
            </div>
        `;

        const gameContainer = document.querySelector('.game-container');
        gameContainer.parentNode.insertBefore(container, gameContainer.nextSibling); */

        this.historyElement = document.querySelector('.leaderboard-list');
        this.bestScoreElement = document.querySelector('.best-score span');
        this.trendElement = document.querySelector('.score-trend');

        // 添加分享功能到全局作用域
        window.shareScore = () => this.shareScore();
    }

    // 获取历史数据
    getHistory() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // 保存历史数据
    saveHistory(history) {
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }

    // 生成鼓励性消息
    getEncouragementMessage(currentScore, previousScores, isGameOver) {
        if (previousScores.length === 0) {
            if (!isGameOver) {
                return "开始游戏吧！创造你的记录！";
            }
            return "首次尝试！继续加油！";
        }

        const lastScore = previousScores[0].score;
        const bestScore = Math.max(...previousScores.map(entry => entry.score));

        if (!isGameOver) {
            if (currentScore > bestScore) {
                return "太棒了！你正在创造新的记录！🎉";
            } else if (currentScore > lastScore) {
                return "继续加油！你正在超越自己！👍";
            }
            return "加油！向最高分进发！💪";
        }
        console.log('lastScore,bestScore,currentScore', lastScore,bestScore,currentScore);
        

        // 游戏结束时的消息
        if (currentScore > bestScore) {
            return "恭喜你！创造了新的记录！🎉";
        } else if (currentScore > lastScore) {
            return "有进步！继续保持！👍";
        } else if (currentScore === lastScore) {
            return "保持稳定，尝试新的策略！💪";
        } else {
            const diff = lastScore - currentScore;
            return `差距${diff}分，下次一定能超越！加油！💪`;
        }
    }

    // 更新分数
    updateScore(score) {
        const history = this.getHistory();
        const newEntry = {
            score: score,
            date: new Date().toLocaleString(),
        };

        // 更新最高分
        if (score > this.bestScore) {
            this.bestScore = score;
        }

        // 添加新记录到历史
        history.unshift(newEntry);
        if (history.length > this.maxEntries) {
            history.length = this.maxEntries;
        }

        this.saveHistory(history);
        this.updateDisplay(score, true);
    }

    // 更新显示
    updateDisplay(currentScore, isGameOver) {
        const history = this.getHistory();

        // 更新最高分
        this.bestScoreElement.textContent = this.bestScore;

        // 更新趋势信息
        const encouragement = this.getEncouragementMessage(currentScore, history, isGameOver);
        this.trendElement.innerHTML = `<div class="encouragement">${encouragement}</div>`;

        // 更新历史记录列表
        const html = history.map((entry, index) => {
            const isLatest = index === 0;
            return `
                <div class="leaderboard-entry ${isLatest ? 'current-score' : ''}">
                    <span class="date">${entry.date}</span>
                    <span class="score">${entry.score}</span>
                </div>
            `;
        }).join('');

        this.historyElement.innerHTML = html || '<div class="no-records">还没有游戏记录，开始你的第一局吧！</div>';
    }

    // 分享功能
    shareScore() {
        const text = `我在2048游戏中获得了${this.bestScore}分！来挑战我吧！🎮`;

        if (navigator.share) {
            navigator.share({
                title: '2048游戏分数',
                text: text,
                url: window.location.href
            }).catch(err => {
                this.fallbackShare(text);
            });
        } else {
            this.fallbackShare(text);
        }
    }

    fallbackShare(text) {
        // 创建临时输入框复制文本
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('分享文本已复制到剪贴板！');
    }
} 