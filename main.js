// 数据结构定义
let knowledgePoints = JSON.parse(localStorage.getItem('knowledgePoints')) || [];
let practiceRecords = JSON.parse(localStorage.getItem('practiceRecords')) || [];
let studyPlans = JSON.parse(localStorage.getItem('studyPlans')) || [];

// DOM元素
const navButtons = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const subjectItems = document.querySelectorAll('.subject-item');

// 页面切换功能
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSection = `${button.id.replace('-btn', '-section')}`;
        
        // 更新导航按钮状态
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // 显示目标内容区
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
        
        // 根据页面刷新数据
        if (targetSection === 'overview-section') {
            updateOverview();
        } else if (targetSection === 'review-section') {
            renderCharts();
            updateReviewTable();
        } else if (targetSection === 'plan-section') {
            renderStudyPlans();
        }
    });
});

// 学科选择功能
subjectItems.forEach(item => {
    item.addEventListener('click', () => {
        // 移除所有学科项的激活状态
        subjectItems.forEach(i => i.classList.remove('active'));
        // 添加当前点击项的激活状态
        item.classList.add('active');
        // 获取选中的学科
        const selectedSubject = item.getAttribute('data-subject');
        // 更新概览页面内容
        updateOverview(selectedSubject);
    });
});

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    updateOverview();
    
    // 知识点录入功能
    document.getElementById('save-content-btn').addEventListener('click', saveContent);
    
    // 文件上传功能
    document.getElementById('upload-file-btn').addEventListener('click', handleFileUpload);

    // 处理文件上传
    function handleFileUpload() {
        const fileInput = document.getElementById('file-input-upload');
        const file = fileInput.files[0];
        const statusDiv = document.getElementById('upload-status');
        
        if (!file) {
            showStatus('请选择一个文件', true);
            return;
        }
        
        const allowedTypes = ['application/pdf', 'application/msword', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!allowedTypes.includes(file.type)) {
            showStatus('只支持PDF、DOC、DOCX格式的文件', true);
            return;
        }
        
        // 显示上传状态
        showStatus('正在处理文件，请稍候...', false);
        
        // 模拟文件处理过程（实际项目中这里应该使用后端API或专门的库来解析文件）
        setTimeout(() => {
            showStatus('文件处理完成！内容已自动填入文本框中。', false);
            
            // 将文件名作为内容填入文本框作为示例
            document.getElementById('content-input').value = 
                `从文件"${file.name}"中提取的内容将显示在这里。\n\n` +
                '注意：在实际应用中，您需要使用专门的库（如pdf.js处理PDF，mammoth.js处理DOCX）' +
                '或后端服务来提取文件内容。';
        }, 2000);
    }

    // 显示状态信息
    function showStatus(message, isError) {
        const statusDiv = document.getElementById('upload-status');
        statusDiv.textContent = message;
        statusDiv.className = 'upload-status';
        if (isError) {
            statusDiv.classList.add('error');
        }
        statusDiv.style.display = 'block';
    }
    
    // 学习计划功能
    document.getElementById('save-plan-btn').addEventListener('click', saveStudyPlan);
    
    // 数据备份与恢复
    document.getElementById('backup-btn').addEventListener('click', backupData);
    document.getElementById('restore-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', restoreData);
    
    // 专项刷题功能
    document.getElementById('start-practice-btn').addEventListener('click', startPractice);
    document.getElementById('mark-weak-btn').addEventListener('click', markWeakPoint);
});

// 保存知识点内容
function saveContent() {
    const subject = document.getElementById('subject-select').value;
    const contentType = document.getElementById('content-type').value;
    const content = document.getElementById('content-input').value;
    
    if (!content.trim()) {
        alert('请输入内容');
        return;
    }
    
    // 创建知识点对象
    const point = {
        id: Date.now(),
        subject: subject,
        type: contentType,
        content: content,
        weakPoint: false,
        mastered: false,
        createdAt: new Date().toISOString()
    };
    
    knowledgePoints.push(point);
    localStorage.setItem('knowledgePoints', JSON.stringify(knowledgePoints));
    
    alert('内容保存成功！');
    document.getElementById('content-input').value = '';
    updateOverview();
}

// 保存学习计划
function saveStudyPlan() {
    const date = document.getElementById('plan-date').value;
    const subject = document.getElementById('plan-subject').value;
    const content = document.getElementById('plan-content').value;
    
    if (!date || !content.trim()) {
        alert('请填写完整信息');
        return;
    }
    
    const plan = {
        id: Date.now(),
        date: date,
        subject: subject,
        content: content,
        completed: false
    };
    
    studyPlans.push(plan);
    localStorage.setItem('studyPlans', JSON.stringify(studyPlans));
    
    alert('学习计划保存成功！');
    document.getElementById('plan-content').value = '';
    renderStudyPlans();
}

// 渲染学习计划
function renderStudyPlans() {
    const container = document.getElementById('plans-container');
    container.innerHTML = '';
    
    if (studyPlans.length === 0) {
        container.innerHTML = '<p>暂无学习计划</p>';
        return;
    }
    
    studyPlans.forEach(plan => {
        const li = document.createElement('li');
        li.className = 'plan-item';
        li.innerHTML = `
            <div class="plan-item-header">
                <span>${plan.date}</span>
                <span class="subject-tag" style="background-color: var(--${plan.subject}-color)">
                    ${getSubjectName(plan.subject)}
                </span>
            </div>
            <div class="plan-item-content">
                <p>${plan.content}</p>
            </div>
        `;
        container.appendChild(li);
    });
}

// 开始练习
function startPractice() {
    const subject = document.getElementById('practice-subject').value;
    const questions = knowledgePoints.filter(point => 
        point.subject === subject && (point.type === 'question' || point.type === 'coding')
    );
    
    if (questions.length === 0) {
        alert('该学科暂无题目，请先录入题目');
        return;
    }
    
    // 显示代码编辑器（如果是编程题）
    const isCodingSubject = ['cpp', 'python', 'java'].includes(subject);
    const codeInput = document.getElementById('code-input');
    codeInput.style.display = isCodingSubject ? 'block' : 'none';
    
    // 这里可以实现具体的练习逻辑
    alert(`开始练习${getSubjectName(subject)}，共${questions.length}题`);
}

// 标记薄弱点
function markWeakPoint() {
    // 实现标记薄弱点的逻辑
    alert('已标记为薄弱点');
}

// 渲染图表
function renderCharts() {
    // 学科分布图
    const subjectCtx = document.getElementById('subject-chart').getContext('2d');
    new Chart(subjectCtx, {
        type: 'pie',
        data: {
            labels: ['编程', '计组/数据结构', '数学', '英语', '考研政治', '申论', '行政职业能力测验', '线性代数', '操作系统', '计算机网络'],
            datasets: [{
                data: [
                    knowledgePoints.filter(p => p.subject === 'programming').length,
                    knowledgePoints.filter(p => p.subject === 'computer').length,
                    knowledgePoints.filter(p => p.subject === 'math').length,
                    knowledgePoints.filter(p => p.subject === 'english').length,
                    // 新增科目数据统计
                    knowledgePoints.filter(p => p.subject === 'politics').length,
                    knowledgePoints.filter(p => p.subject === 'shenlun').length,
                    knowledgePoints.filter(p => p.subject === 'ability-test').length,
                    knowledgePoints.filter(p => p.subject === 'linear-algebra').length,
                    knowledgePoints.filter(p => p.subject === 'operating-system').length,
                    knowledgePoints.filter(p => p.subject === 'computer-network').length
                ],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FF9800',
                    '#9C27B0',
                    '#FF5722',
                    '#607D8B',
                    '#795548',
                    '#009688',
                    '#3F51B5',
                    '#E91E63'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: '知识点学科分布'
                }
            }
        }
    });
    
    // 进度图
    const progressCtx = document.getElementById('progress-chart').getContext('2d');
    const masteredCount = knowledgePoints.filter(p => p.mastered).length;
    const totalCount = knowledgePoints.length;
    
    new Chart(progressCtx, {
        type: 'doughnut',
        data: {
            labels: ['已掌握', '未掌握'],
            datasets: [{
                data: [masteredCount, totalCount - masteredCount],
                backgroundColor: ['#4CAF50', '#f44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: '掌握进度'
                }
            }
        }
    });
}

// 更新复盘表格
function updateReviewTable() {
    const tbody = document.getElementById('review-records');
    tbody.innerHTML = '';
    
    if (practiceRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">暂无练习记录</td></tr>';
        return;
    }
    
    // 只显示最近10条记录
    const recentRecords = practiceRecords.slice(-10).reverse();
    
    recentRecords.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.date}</td>
            <td>${getSubjectName(record.subject)}</td>
            <td>${record.questionCount}</td>
            <td>${record.accuracy}%</td>
        `;
        tbody.appendChild(tr);
    });
}

// 数据备份
function backupData() {
    const data = {
        knowledgePoints,
        practiceRecords,
        studyPlans
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// 数据恢复
function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.knowledgePoints) knowledgePoints = data.knowledgePoints;
            if (data.practiceRecords) practiceRecords = data.practiceRecords;
            if (data.studyPlans) studyPlans = data.studyPlans;
            
            localStorage.setItem('knowledgePoints', JSON.stringify(knowledgePoints));
            localStorage.setItem('practiceRecords', JSON.stringify(practiceRecords));
            localStorage.setItem('studyPlans', JSON.stringify(studyPlans));
            
            alert('数据恢复成功！');
            updateOverview();
        } catch (error) {
            alert('数据恢复失败：文件格式错误');
        }
    };
    reader.readAsText(file);
}