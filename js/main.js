// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

let currentFile = null;
let compressedBlob = null;

// 处理拖放
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007AFF';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#c7c7c7';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#c7c7c7';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

// 处理文件选择
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

// 处理图片上传
async function handleImageUpload(file) {
    currentFile = file;
    
    // 显示原始图片
    originalImage.src = URL.createObjectURL(file);
    originalSize.textContent = formatFileSize(file.size);
    
    // 压缩图片
    await compressImage(file, qualitySlider.value / 100);
    
    // 显示预览区域
    previewContainer.style.display = 'block';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 压缩图片
async function compressImage(file, quality) {
    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            quality: quality
        };

        compressedBlob = await imageCompression(file, options);
        compressedImage.src = URL.createObjectURL(compressedBlob);
        compressedSize.textContent = formatFileSize(compressedBlob.size);
        
        // 更新压缩率显示
        const compressionRatio = ((1 - compressedBlob.size / file.size) * 100).toFixed(1);
        compressedSize.textContent = `${formatFileSize(compressedBlob.size)} (减小了 ${compressionRatio}%)`;
    } catch (error) {
        console.error('压缩失败:', error);
    }
}

// 处理质量滑块变化
qualitySlider.addEventListener('input', (e) => {
    const quality = e.target.value;
    qualityValue.textContent = quality + '%';
    if (currentFile) {
        compressImage(currentFile, quality / 100);
    }
});

// 处理下载
downloadBtn.addEventListener('click', () => {
    if (compressedBlob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedBlob);
        
        // 生成文件名
        const extension = currentFile.name.split('.').pop();
        const filename = `compressed_${Date.now()}.${extension}`;
        
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}); 