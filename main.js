document.addEventListener('DOMContentLoaded', function() {
            // Initial setup
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const rememberMe = localStorage.getItem('rememberMe') === 'true';
            let walletBalance = parseFloat(localStorage.getItem('walletBalance') || '0');
            let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            let feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');

            // Preload auto feedbacks if empty
            if (feedbacks.length === 0) {
                feedbacks = [
                    { text: 'This app is amazing! 🚀', reactions: { '👍': 5, '❤️': 3 } },
                    { text: 'Great coding challenges! 💡', reactions: { '👍': 4, '🔥': 2 } },
                    { text: 'Love the rewards system! 🏆', reactions: { '👍': 6, '💎': 1 } }
                ];
                localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
            }

            updateWalletDisplay();

            if (currentUser && rememberMe) {
                document.querySelector('.logo-animation').style.display = 'none';
                updateUserInfo(currentUser);
                updateProfilePage(currentUser);
                showPage('home');
                loadTransactions();
                loadFeedbacks();
            } else {
                setTimeout(() => {
                    document.querySelector('.logo-animation').style.display = 'none';
                    document.getElementById('login-form').classList.add('active');
                }, 4000);
            }

            // Exit intent
            let exitIntentTriggered = false;
            document.addEventListener('mouseout', (e) => {
                if (!exitIntentTriggered && e.clientY < 10) {
                    showExitIntent();
                }
            });
            window.addEventListener('beforeunload', (e) => {
                if (!exitIntentTriggered) {
                    e.preventDefault();
                    e.returnValue = '';
                }
            });

            document.getElementById('stay-button').addEventListener('click', () => {
                document.getElementById('exit-intent-modal').style.display = 'none';
                exitIntentTriggered = true;
            });

            document.getElementById('leave-button').addEventListener('click', () => {
                document.getElementById('exit-intent-modal').style.display = 'none';
                exitIntentTriggered = true;
            });

            function showExitIntent() {
                if (!exitIntentTriggered) {
                    document.getElementById('exit-intent-modal').style.display = 'flex';
                    exitIntentTriggered = true;
                }
            }

            // Sidebar
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');
            const closeSidebar = document.getElementById('close-sidebar');
            const mainContent = document.getElementById('main-content');

            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.add('open');
                mainContent.classList.add('blur-content');
            });

            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('open');
                mainContent.classList.remove('blur-content');
            });

            // Auth toggling
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            document.getElementById('show-signup').addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.classList.remove('active');
                signupForm.classList.add('active');
            });
            document.getElementById('show-login').addEventListener('click', (e) => {
                e.preventDefault();
                signupForm.classList.remove('active');
                loginForm.classList.add('active');
            });

            // Login
            document.getElementById('login-button').addEventListener('click', () => {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('remember-me').checked;

                if (email && password) {
                    const user = {
                        name: email.split('@')[0],
                        email: email,
                        avatar: email.charAt(0).toUpperCase(),
                        wins: Math.floor(Math.random() * 20),
                        challenges: Math.floor(Math.random() * 30),
                        earnings: Math.floor(Math.random() * 500),
                        rating: 1200 + Math.floor(Math.random() * 500),
                        github: localStorage.getItem('githubUsername') || ''
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('rememberMe', rememberMe);
                    loginForm.classList.remove('active');
                    updateUserInfo(user);
                    updateProfilePage(user);
                    showPage('home');
                    loadTransactions();
                    loadFeedbacks();
                } else {
                    alert('Please enter both email and password');
                }
            });

            // Signup
            document.getElementById('signup-button').addEventListener('click', () => {
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const github = document.getElementById('github-username').value;

                if (name && email && password) {
                    const user = {
                        name: name,
                        email: email,
                        avatar: name.charAt(0).toUpperCase(),
                        github: github,
                        wins: 0,
                        challenges: 0,
                        earnings: 0,
                        rating: 1200
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('rememberMe', true);
                    if (github) localStorage.setItem('githubUsername', github);
                    signupForm.classList.remove('active');
                    updateUserInfo(user);
                    updateProfilePage(user);
                    showPage('home');
                    loadTransactions();
                    loadFeedbacks();
                } else {
                    alert('Please fill all required fields');
                }
            });

            // Logout
            document.getElementById('logout-button').addEventListener('click', (e) => {
                e.preventDefault();
                showExitIntent();
                localStorage.removeItem('currentUser');
                localStorage.removeItem('rememberMe');
                sessionStorage.clear();
                document.getElementById('user-name').textContent = 'Guest';
                document.getElementById('user-avatar').textContent = 'G';
                sidebar.classList.remove('open');
                showPage('home');
                alert('You have been successfully logged out.');
            });

            // GitHub connect
            document.getElementById('connect-github').addEventListener('click', () => {
                const username = prompt('Enter your GitHub username:');
                if (username) {
                    localStorage.setItem('githubUsername', username);
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (currentUser) {
                        currentUser.github = username;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        updateProfilePage(currentUser);
                    }
                    fetchGitHubData(username);
                }
            });

            // Compiler
            document.getElementById('run-code').addEventListener('click', runCode);
            document.getElementById('submit-code').addEventListener('click', submitCode);

            // Navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = link.getAttribute('data-page');
                    showPage(page);
                });
            });

            // Challenge flow
            document.querySelectorAll('.start-challenge-btn, #start-challenge').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (currentUser) {
                        showPage('level-selection');
                    } else {
                        document.getElementById('login-form').classList.add('active');
                        alert('Please login to start a challenge');
                    }
                });
            });

            document.querySelectorAll('.level-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const level = e.target.getAttribute('data-level');
                    localStorage.setItem('selectedLevel', level);
                    showPage('mode-selection');
                });
            });

            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mode = e.target.getAttribute('data-mode');
                    localStorage.setItem('selectedMode', mode);
                    showPage('placeholder');
                });
            });

            // Wallet functionality
            document.getElementById('add-funds-btn').addEventListener('click', () => {
                document.getElementById('add-funds-modal').classList.add('active');
            });
            document.getElementById('withdraw-funds-btn').addEventListener('click', () => {
                document.getElementById('withdraw-funds-modal').classList.add('active');
            });
            document.getElementById('cancel-add').addEventListener('click', () => {
                document.getElementById('add-funds-modal').classList.remove('active');
            });
            document.getElementById('cancel-withdraw').addEventListener('click', () => {
                document.getElementById('withdraw-funds-modal').classList.remove('active');
            });
            document.getElementById('confirm-add').addEventListener('click', () => {
                const amount = parseFloat(document.getElementById('add-amount').value);
                if (amount > 0) {
                    walletBalance += amount;
                    localStorage.setItem('walletBalance', walletBalance);
                    addTransaction(`+ $${amount} added`);
                    updateWalletDisplay();
                    document.getElementById('add-funds-modal').classList.remove('active');
                    alert('Funds added successfully!');
                } else {
                    alert('Please enter a valid amount');
                }
            });
            document.getElementById('confirm-withdraw').addEventListener('click', () => {
                const amount = parseFloat(document.getElementById('withdraw-amount').value);
                if (amount > 0 && amount <= walletBalance) {
                    walletBalance -= amount;
                    localStorage.setItem('walletBalance', walletBalance);
                    addTransaction(`- $${amount} withdrawn`);
                    updateWalletDisplay();
                    document.getElementById('withdraw-funds-modal').classList.remove('active');
                    alert('Funds withdrawn successfully!');
                } else {
                    alert('Invalid amount or insufficient balance');
                }
            });

            function updateWalletDisplay() {
                document.getElementById('wallet-balance').textContent = `$${walletBalance.toFixed(2)}`;
                document.getElementById('wallet-page-balance').textContent = `Current Balance: $${walletBalance.toFixed(2)}`;
            }

            function addTransaction(desc) {
                transactions.push({ date: new Date().toLocaleString(), desc });
                localStorage.setItem('transactions', JSON.stringify(transactions));
                loadTransactions();
            }

            function loadTransactions() {
                const historyList = document.getElementById('transaction-history');
                historyList.innerHTML = '';
                transactions.forEach(tx => {
                    const li = document.createElement('li');
                    li.textContent = `${tx.date} - ${tx.desc}`;
                    historyList.appendChild(li);
                });
            }

            // Feedback functionality
            const feedbackToggle = document.getElementById('feedback-toggle');
            const feedbackContainer = document.getElementById('feedback-container');
            const closeFeedback = document.getElementById('close-feedback');
            const feedbackInput = document.getElementById('feedback-input');
            const sendFeedback = document.getElementById('send-feedback');

            feedbackToggle.addEventListener('click', () => {
                feedbackContainer.classList.toggle('active');
            });

            closeFeedback.addEventListener('click', () => {
                feedbackContainer.classList.remove('active');
            });

            sendFeedback.addEventListener('click', () => {
                const text = feedbackInput.value.trim();
                if (text) {
                    feedbacks.push({ text, reactions: {} });
                    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
                    loadFeedbacks();
                    feedbackInput.value = '';
                }
            });

            function loadFeedbacks() {
                const feedbackList = document.getElementById('feedback-list');
                feedbackList.innerHTML = '';
                feedbacks.forEach((fb, index) => {
                    const item = document.createElement('div');
                    item.className = 'feedback-item';
                    item.innerHTML = `
                        <p>${fb.text}</p>
                        <div class="feedback-reactions">
                            ${Object.keys(fb.reactions).map(emoji => `<span class="react" data-index="${index}" data-emoji="${emoji}">${emoji} ${fb.reactions[emoji]}</span>`).join('')}
                            <button class="react-add" data-index="${index}">+</button>
                        </div>
                    `;
                    feedbackList.appendChild(item);
                });

                // Add reaction listeners
                feedbackList.querySelectorAll('.react-add').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = e.target.getAttribute('data-index');
                        const emoji = prompt('Enter emoji:');
                        if (emoji) {
                            if (!feedbacks[index].reactions[emoji]) feedbacks[index].reactions[emoji] = 0;
                            feedbacks[index].reactions[emoji]++;
                            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
                            loadFeedbacks();
                        }
                    });
                });

                feedbackList.querySelectorAll('.react').forEach(span => {
                    span.addEventListener('click', (e) => {
                        const index = e.target.getAttribute('data-index');
                        const emoji = e.target.getAttribute('data-emoji');
                        feedbacks[index].reactions[emoji]++;
                        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
                        loadFeedbacks();
                    });
                });
            }

            function updateUserInfo(user) {
                document.getElementById('user-name').textContent = user.name;
                document.getElementById('user-avatar').textContent = user.avatar;
            }

            function updateProfilePage(user) {
                document.getElementById('profile-name').textContent = user.name;
                document.getElementById('profile-email').textContent = user.email;
                document.getElementById('profile-avatar').textContent = user.avatar;
                document.getElementById('profile-wins').textContent = user.wins;
                document.getElementById('profile-challenges').textContent = user.challenges;
                document.getElementById('profile-earnings').textContent = '$' + user.earnings;
                document.getElementById('profile-rating').textContent = user.rating;

                let level = 'Level 1 - Beginner';
                if (user.rating >= 1400) level = 'Level 2 - Intermediate';
                if (user.rating >= 1600) level = 'Level 3 - Advanced';
                if (user.rating >= 1800) level = 'Level 4 - Expert';
                if (user.rating >= 2000) level = 'Level 5 - Master';
                document.getElementById('profile-level').textContent = level;

                if (user.github) {
                    document.getElementById('profile-github').textContent = 'GitHub: ' + user.github;
                    document.getElementById('github-connected').style.display = 'flex';
                    document.getElementById('connect-github').style.display = 'none';
                    document.getElementById('github-repos').style.display = 'block';
                    fetchGitHubData(user.github);
                } else {
                    document.getElementById('profile-github').textContent = 'GitHub: Not connected';
                    document.getElementById('github-connected').style.display = 'none';
                    document.getElementById('connect-github').style.display = 'block';
                    document.getElementById('github-repos').style.display = 'none';
                }
            }

            function fetchGitHubData(username) {
                if (!username) return;
                document.getElementById('repos-container').innerHTML = '<p>Loading repositories...</p>';
                setTimeout(() => {
                    const mockRepos = [
                        { name: 'awesome-project', description: 'An awesome project with great code', stars: 15, forks: 3, language: 'JavaScript' },
                        { name: 'code-challenges', description: 'Solutions to various coding challenges', stars: 8, forks: 2, language: 'Python' },
                        { name: 'web-app', description: 'A responsive web application', stars: 22, forks: 5, language: 'TypeScript' },
                        { name: 'algorithm-library', description: 'Collection of useful algorithms', stars: 31, forks: 7, language: 'Java' }
                    ];
                    let reposHTML = '';
                    mockRepos.forEach(repo => {
                        reposHTML += `
                            <div class="repo-card">
                                <h4>${repo.name}</h4>
                                <p>${repo.description}</p>
                                <div class="repo-stats">
                                    <span><i class="fas fa-star"></i> ${repo.stars}</span>
                                    <span><i class="fas fa-code-branch"></i> ${repo.forks}</span>
                                    <span><i class="fas fa-circle" style="color: #f1e05a;"></i> ${repo.language}</span>
                                </div>
                            </div>
                        `;
                    });
                    document.getElementById('repos-container').innerHTML = reposHTML;
                }, 1500);
            }

            function runCode() {
                document.getElementById('test-result-1').textContent = 'Running...';
                document.getElementById('test-result-2').textContent = 'Running...';
                document.getElementById('test-result-3').textContent = 'Running...';
                setTimeout(() => {
                    const randomSuccess = Math.random() > 0.3;
                    if (randomSuccess) {
                        ['1', '2', '3'].forEach(id => {
                            document.getElementById(`test-result-${id}`).textContent = 'Pass';
                            document.getElementById(`test-result-${id}`).className = 'test-result test-pass';
                        });
                    } else {
                        document.getElementById('test-result-1').textContent = 'Pass';
                        document.getElementById('test-result-1').className = 'test-result test-pass';
                        document.getElementById('test-result-2').textContent = 'Fail';
                        document.getElementById('test-result-2').className = 'test-result test-fail';
                        document.getElementById('test-result-3').textContent = 'Pass';
                        document.getElementById('test-result-3').className = 'test-result test-pass';
                    }
                }, 1000);
            }

            function submitCode() {
                runCode();
                setTimeout(() => {
                    const allPass = document.getElementById('test-result-2').textContent === 'Pass';
                    if (allPass) {
                        alert('Congratulations! Your solution passed all test cases.');
                    } else {
                        alert('Your solution failed some test cases. Please try again.');
                    }
                }, 1500);
            }

            function startTimer(duration) {
                let timer = duration;
                let minutes, seconds;
                const countdown = setInterval(() => {
                    minutes = parseInt(timer / 60, 10);
                    seconds = parseInt(timer % 60, 10);
                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;
                    document.getElementById('timer').textContent = minutes + ":" + seconds;
                    if (--timer < 0) {
                        clearInterval(countdown);
                        alert('Time is up! Your solution has been submitted.');
                    }
                }, 1000);
            }

            // function showPage(page) {
            //     document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
            //     const target = document.getElementById(`${page}-page`);
            //     if (target) target.style.display = 'block';

            //     if (!currentUser && ['profile', 'wallet', 'history', 'referral', 'settings', 'messages', 'compiler', 'challenges', 'level-selection', 'mode-selection', 'placeholder'].includes(page)) {
            //         document.getElementById('login-form').classList.add('active');
            //         alert('Please login to access this page');
            //         showPage('home');
            //         return;
            //     }

            //     if (page === 'compiler') startTimer(15 * 60);
            //     if (page === 'wallet') loadTransactions();
            // }

            function showPage(page) {
    document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
    const target = document.getElementById(`${page}-page`);
    if (target) target.style.display = 'block';

    // Remove the login check here, so the block below is no longer executed.
    // if (!currentUser && ['profile', 'wallet', 'history', 'referral', 'settings', 'messages', 'compiler', 'challenges', 'level-selection', 'mode-selection', 'placeholder'].includes(page)) {
    //     document.getElementById('login-form').classList.add('active');
    //     alert('Please login to access this page');
    //     showPage('home');
    //     return;
    // }

    if (page === 'compiler') startTimer(15 * 60);
    if (page === 'wallet') loadTransactions();
}

            const fadeElements = document.querySelectorAll('.fade-in');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.style.opacity = 1;
                });
            }, { threshold: 0.1 });

            fadeElements.forEach(element => {
                element.style.opacity = 0;
                element.style.transition = 'opacity 0.5s ease-in-out';
                observer.observe(element);
            });

            // Messages Functionality (unchanged from original)
            (function () {
                // ... (keep the original messages script here)
                const messagesEl = document.getElementById('messages');
                const inboxCountEl = document.getElementById('inboxCount');
                const navBadgeEl = document.getElementById('navBadge');
                const clearUnreadBtn = document.getElementById('clearUnread');
                const seedBtn = document.getElementById('seedMessages');
                const composerInput = document.getElementById('composerInput');
                const sendBtn = document.getElementById('sendBtn');

                const emojiPicker = document.getElementById('emojiPicker');
                const emojiGrid = document.getElementById('emojiGrid');

                const BASE_TITLE = 'Code Cash';

                // Emoji sets
                const defaultReacts = ['👍', '🔥', '💡', '🎯', '🚀'];
                const pickerEmojis = ['👍','🔥','💡','🎯','🚀','🏆','💥','🧠','⏱','✨','🛡','📣','⚡','🧩','🔁','📈','🎁','🤝','🧪','🧭','📎','🧵','🪄','🎮','🤖','🧱','🧯','🪙','💎','🌀'];

                // "Innovative" message templates
                const users = ['Ava','Noah','Mia','Liam','Zoe','Ethan','Ivy','Kai','Jax','Lux','Nova','Aria'];
                const tips = [
                    '💡 Tip: Greedy fails on this one — try DP instead.',
                    '🧠 Pro-move: Binary search the answer range.',
                    '⚡ Micro-optimizations matter — cache that result!',
                    '🧪 Edge case alert: empty arrays and singletons.',
                    '📈 Think O(n log n). Always elegant, often enough.',
                ];
                const challenges = [
                    '🚀 1v1 challenge incoming! Best of 3 on Hard?',
                    '🎯 Duel invite: Medium-to-Hard escalation mode.',
                    '📣 Speedrun: 3-minute Easy blitz — no boilerplate.',
                    '🏆 Tournament bracket updated — you just moved up!',
                    '🏡 Defend your rank: sudden death tiebreaker.',
                ];
                const rewards = [
                    '🎁 Daily streak hit! +25 bonus points.',
                    '🪙 Wallet airdrop: +0.02 test ETH for grinding.',
                    '💎 Milestone unlocked: “Late-night Coder” badge.',
                    '🔁 Rematch token earned — retry any L today.',
                ];

                let unread = 0;
                let hiddenSince = 0;

                function updateCounters() {
                    inboxCountEl.textContent = messagesEl.childElementCount;
                    if (unread > 0) {
                        navBadgeEl.style.display = 'inline-flex';
                        navBadgeEl.textContent = String(unread);
                        document.title = `🔔 ${unread} new — ${BASE_TITLE}`;
                    } else {
                        navBadgeEl.style.display = 'none';
                        document.title = BASE_TITLE;
                    }
                }

                function setUnread(count) {
                    unread = Math.max(0, count);
                    updateCounters();
                }

                function startHiddenTicker() {
                    if (hiddenSince) return;
                    hiddenSince = Date.now();
                    let toggle = false;
                    const tick = () => {
                        if (!document.hidden) { hiddenSince = 0; document.title = BASE_TITLE; return; }
                        if (unread > 0) {
                            document.title = toggle ? `📣 ${unread} new duel invites!` : `💬 ${unread} new messages — ${BASE_TITLE}`;
                            toggle = !toggle;
                        }
                        setTimeout(tick, 1600);
                    };
                    tick();
                }

                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        startHiddenTicker();
                    } else {
                        document.title = BASE_TITLE;
                    }
                });

                function randOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
                function nowTime() {
                    const d = new Date();
                    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }

                function avatarLetter(name) {
                    return (name || '?').slice(0,1).toUpperCase();
                }

                function makeReactions(initial = defaultReacts) {
                    const wrap = document.createElement('div');
                    wrap.className = 'reactions';
                    initial.forEach(e => {
                        const btn = document.createElement('button');
                        btn.className = 'react';
                        btn.type = 'button';
                        btn.setAttribute('aria-pressed', 'false');
                        btn.innerHTML = `<span>${e}</span><span class="count">0</span>`;
                        btn.addEventListener('click', () => {
                            const active = btn.classList.toggle('active');
                            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
                            const countEl = btn.querySelector('.count');
                            const current = parseInt(countEl.textContent || '0', 10);
                            countEl.textContent = String(Math.max(0, current + (active ? 1 : -1)));
                        });
                        wrap.appendChild(btn);
                    });
                    const addBtn = document.createElement('button');
                    addBtn.className = 'react react-add';
                    addBtn.type = 'button';
                    addBtn.title = 'Add reaction';
                    addBtn.textContent = '➕';
                    addBtn.addEventListener('click', (e) => openEmojiPickerAt(e.currentTarget, wrap));
                    wrap.appendChild(addBtn);
                    return wrap;
                }

                function openEmojiPickerAt(anchorBtn, reactionsWrap) {
                    const rect = anchorBtn.getBoundingClientRect();
                    emojiGrid.innerHTML = '';
                    pickerEmojis.forEach(e => {
                        const b = document.createElement('button');
                        b.className = 'emoji-btn';
                        b.type = 'button';
                        b.textContent = e;
                        b.addEventListener('click', () => {
                            const existing = Array.from(reactionsWrap.querySelectorAll('.react'))
                              .find(el => el.textContent && el.textContent.trim().startsWith(e));
                            if (existing) {
                                const countEl = existing.querySelector('.count');
                                const active = !existing.classList.contains('active');
                                existing.classList.toggle('active', active);
                                existing.setAttribute('aria-pressed', active ? 'true' : 'false');
                                const current = parseInt(countEl.textContent || '0', 10);
                                countEl.textContent = String(current + (active ? 1 : -1));
                            } else {
                                const btn = document.createElement('button');
                                btn.className = 'react active';
                                btn.type = 'button';
                                btn.setAttribute('aria-pressed', 'true');
                                btn.innerHTML = `<span>${e}</span><span class="count">1</span>`;
                                btn.addEventListener('click', () => {
                                    const active = btn.classList.toggle('active');
                                    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
                                    const countEl = btn.querySelector('.count');
                                    const current = parseInt(countEl.textContent || '0', 10);
                                    countEl.textContent = String(Math.max(0, current + (active ? 1 : -1)));
                                });
                                reactionsWrap.insertBefore(btn, reactionsWrap.lastElementChild);
                            }
                            closeEmojiPicker();
                        });
                        emojiGrid.appendChild(b);
                    });
                    emojiPicker.style.display = 'block';
                    const top = rect.top + window.scrollY - emojiPicker.offsetHeight - 6;
                    const left = rect.left + window.scrollX - (emojiPicker.offsetWidth - rect.width);
                    emojiPicker.style.top = Math.max(8, top) + 'px';
                    emojiPicker.style.left = Math.max(8, left) + 'px';
                    document.addEventListener('click', onPickerOutside, { once: true });
                }

                function onPickerOutside(e) {
                    if (!emojiPicker.contains(e.target)) closeEmojiPicker();
                }
                function closeEmojiPicker() {
                    emojiPicker.style.display = 'none';
                }

                function renderMessage({ kind, author, text, metaChip }) {
                    const li = document.createElement('div');
                    li.className = `bubble ${kind || ''}`;

                    const avatar = document.createElement('div');
                    avatar.className = 'avatar';
                    avatar.textContent = author ? avatarLetter(author) : '⏱';
                    li.appendChild(avatar);

                    const msgWrap = document.createElement('div');
                    msgWrap.className = 'msg';
                    const meta = document.createElement('div');
                    meta.className = 'meta';
                    meta.innerHTML = `<strong>${author || 'System'}</strong> • <span>${nowTime()}</span>`;
                    msgWrap.appendChild(meta);

                    const content = document.createElement('div');
                    content.className = 'content';
                    const span = document.createElement('span');
                    span.innerHTML = text;
                    content.appendChild(span);

                    if (metaChip) {
                        const chip = document.createElement('span');
                        chip.className = 'chip';
                        chip.innerHTML = metaChip;
                        content.appendChild(document.createTextNode(' '));
                        content.appendChild(chip);
                    }

                    msgWrap.appendChild(content);
                    msgWrap.appendChild(makeReactions());
                    li.appendChild(msgWrap);

                    messagesEl.appendChild(li);
                    messagesEl.scrollTop = messagesEl.scrollHeight;

                    if (document.hidden) {
                        setUnread(unread + 1);
                    }
                    updateCounters();
                }

                function seedInnovative(n = 5) {
                    for (let i = 0; i < n; i++) {
                        const bucket = Math.random();
                        if (bucket < 0.33) {
                            renderMessage({
                                kind: 'challenge',
                                author: randOf(users),
                                text: randOf(challenges),
                                metaChip: `Mode: <strong>1v1</strong> • Diff: <strong>${randOf(['Easy','Medium','Hard'])}</strong>`,
                            });
                        } else if (bucket < 0.66) {
                            renderMessage({
                                kind: 'reward',
                                author: 'System',
                                text: randOf(rewards),
                                metaChip: `Rank: <strong>#${Math.floor(Math.random()*200)+1}</strong>`,
                            });
                        } else {
                            renderMessage({
                                kind: 'system',
                                author: 'System',
                                text: randOf(tips),
                                metaChip: `Queue: <strong>${randOf(['Solo','Room','1v1'])}</strong>`,
                            });
                        }
                    }
                }

                document.querySelector('[data-page="messages"]').addEventListener('click', () => {
                    messagesEl.scrollTop = messagesEl.scrollHeight;
                    setUnread(0);
                });
                clearUnreadBtn.addEventListener('click', () => setUnread(0));
                seedBtn.addEventListener('click', () => seedInnovative(5));

                document.querySelectorAll('.q-emoji').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const ins = btn.getAttribute('data-insert') || '';
                        composerInput.setRangeText(ins + ' ', composerInput.selectionStart, composerInput.selectionEnd, 'end');
                        composerInput.focus();
                    });
                });

                function sendMessage() {
                    const val = (composerInput.value || '').trim();
                    if (!val) return;
                    renderMessage({
                        kind: '',
                        author: 'You',
                        text: val.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
                    });
                    composerInput.value = '';
                    setUnread(0);
                }
                sendBtn.addEventListener('click', sendMessage);
                composerInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });

                setInterval(() => {
                    const chance = Math.random();
                    if (chance < 0.5) return;
                    seedInnovative(1);
                }, 10000);

                seedInnovative(4);

                const unreadLive = document.createElement('div');
                unreadLive.className = 'sr-only';
                unreadLive.setAttribute('role','status');
                document.body.appendChild(unreadLive);
                const announceUnread = () => { unreadLive.textContent = unread > 0 ? `${unread} new messages` : 'All caught up'; };
                const obs = new MutationObserver(announceUnread);
                obs.observe(navBadgeEl, { childList: true });
            })();
        });