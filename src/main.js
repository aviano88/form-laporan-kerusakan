import './style.css'
import { jsPDF } from 'jspdf'

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle')
const html = document.documentElement

// Cek preferensi tema yang tersimpan atau sistem
const currentTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

if (currentTheme === 'dark') {
    html.classList.add('dark')
}

themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark')
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light'
    localStorage.setItem('theme', newTheme)
})

// Preview Foto Dokumentasi
const fileInput = document.getElementById('unggahDokumentasi')
const previewContainer = document.getElementById('previewContainer')
let uploadedImages = []

fileInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files)
    
    if (files.length > 0) {
        previewContainer.classList.remove('hidden')
        previewContainer.innerHTML = ''
        uploadedImages = []
        
        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                
                reader.onload = function(event) {
                    uploadedImages.push(event.target.result)
                    
                    const imgContainer = document.createElement('div')
                    imgContainer.className = 'relative'
                    
                    const img = document.createElement('img')
                    img.src = event.target.result
                    img.className = 'w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600'
                    
                    const removeBtn = document.createElement('button')
                    removeBtn.innerHTML = '×'
                    removeBtn.className = 'absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm hover:bg-red-600'
                    removeBtn.onclick = function() {
                        uploadedImages.splice(index, 1)
                        imgContainer.remove()
                        if (uploadedImages.length === 0) {
                            previewContainer.classList.add('hidden')
                        }
                    }
                    
                    imgContainer.appendChild(img)
                    imgContainer.appendChild(removeBtn)
                    previewContainer.appendChild(imgContainer)
                }
                
                reader.readAsDataURL(file)
            }
        })
    }
})

// Menambahkan event listener ke tombol unduh
document.getElementById('unduhPdfButton').addEventListener('click', async function() {
    
    // Inisialisasi jsPDF
    const doc = new jsPDF()
    
    // Mengambil semua nilai dari input formulir
    const tanggal = document.getElementById('tanggal').value
    const namaDepan = document.getElementById('namaDepan').value
    const namaBelakang = document.getElementById('namaBelakang').value
    const namaPelapor = `${namaDepan} ${namaBelakang}`.trim()
    const jabatan = document.getElementById('jabatan').value
    const namaPeralatan = document.getElementById('namaPeralatan').value
    const judulKerusakan = document.getElementById('judulKerusakan').value
    const deskripsiKerusakan = document.getElementById('deskripsiKerusakan').value
    const lokasiKerusakan = document.getElementById('lokasiKerusakan').value
    const keteranganTambahan = document.getElementById('keteranganTambahan').value
    const pesanEl = document.getElementById('pesan')

    // Validasi sederhana: pastikan bidang utama diisi
    if (!tanggal || !namaDepan || !jabatan || !namaPeralatan || !judulKerusakan || !deskripsiKerusakan || !lokasiKerusakan) {
        pesanEl.textContent = 'Harap isi semua bidang yang wajib ditandai *.'
        pesanEl.className = 'text-center text-red-600 dark:text-red-400 mt-4'
        return
    }

    pesanEl.textContent = 'Membuat PDF...'
    pesanEl.className = 'text-center text-blue-600 dark:text-blue-400 mt-4'

    // Mulai membuat konten PDF dengan layout profesional
    let yPos = 15
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (2 * margin)
    
    // Header dengan background biru
    doc.setFillColor(37, 99, 235) // Blue-600
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text("LAPORAN KERUSAKAN PERALATAN", pageWidth / 2, 15, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tanggal: ${tanggal}`, pageWidth / 2, 25, { align: 'center' })
    
    yPos = 45
    doc.setTextColor(0, 0, 0)
    
    // Fungsi untuk menambahkan section dengan border
    function addSection(title, content, isBordered = true) {
        if (yPos > pageHeight - 40) {
            doc.addPage()
            yPos = 20
        }
        
        if (isBordered) {
            doc.setFillColor(249, 250, 251) // Gray-50
            doc.roundedRect(margin, yPos - 5, contentWidth, 12, 2, 2, 'F')
        }
        
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(37, 99, 235)
        doc.text(title, margin + 3, yPos + 2)
        
        yPos += 10
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        
        if (typeof content === 'string') {
            const lines = doc.splitTextToSize(content, contentWidth - 6)
            doc.text(lines, margin + 3, yPos)
            yPos += (lines.length * 5) + 8
        } else if (Array.isArray(content)) {
            content.forEach(item => {
                const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 10)
                doc.text(lines, margin + 6, yPos)
                yPos += (lines.length * 5) + 2
            })
            yPos += 8
        }
    }
    
    // Informasi Pelapor (dalam box)
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Nama Pelapor:', margin + 5, yPos + 8)
    doc.setFont('helvetica', 'normal')
    doc.text(namaPelapor, margin + 40, yPos + 8)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Jabatan:', margin + 5, yPos + 16)
    doc.setFont('helvetica', 'normal')
    doc.text(jabatan, margin + 40, yPos + 16)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Lokasi:', margin + 5, yPos + 24)
    doc.setFont('helvetica', 'normal')
    doc.text(lokasiKerusakan, margin + 40, yPos + 24)
    
    yPos += 40
    
    // Informasi Peralatan
    addSection('PERALATAN', namaPeralatan)
    
    // Judul Kerusakan
    addSection('JUDUL KERUSAKAN', judulKerusakan)
    
    // Deskripsi Kerusakan dengan border
    doc.setDrawColor(200, 200, 200)
    const deskLines = doc.splitTextToSize(deskripsiKerusakan || 'Tidak ada deskripsi.', contentWidth - 12)
    const deskHeight = (deskLines.length * 5) + 20
    
    if (yPos + deskHeight > pageHeight - 20) {
        doc.addPage()
        yPos = 20
    }
    
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, yPos - 5, contentWidth, 12, 2, 2, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(37, 99, 235)
    doc.text('DESKRIPSI KERUSAKAN', margin + 3, yPos + 2)
    yPos += 10
    
    doc.roundedRect(margin, yPos, contentWidth, deskHeight - 15, 3, 3)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(deskLines, margin + 5, yPos + 7)
    yPos += deskHeight - 5
    
    // Keterangan Tambahan
    if (keteranganTambahan) {
        addSection('KETERANGAN TAMBAHAN', keteranganTambahan)
    }
    
    // Foto Dokumentasi
    if (uploadedImages.length > 0) {
        if (yPos > pageHeight - 80) {
            doc.addPage()
            yPos = 20
        }
        
        doc.setFillColor(249, 250, 251)
        doc.roundedRect(margin, yPos - 5, contentWidth, 12, 2, 2, 'F')
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(37, 99, 235)
        doc.text('DOKUMENTASI FOTO', margin + 3, yPos + 2)
        yPos += 15
        
        const imgWidth = 80
        const imgHeight = 60
        const imgsPerRow = 2
        const imgSpacing = 10
        
        for (let i = 0; i < uploadedImages.length; i++) {
            const col = i % imgsPerRow
            const row = Math.floor(i / imgsPerRow)
            
            if (row > 0 && col === 0) {
                yPos += imgHeight + imgSpacing
                
                if (yPos + imgHeight > pageHeight - 20) {
                    doc.addPage()
                    yPos = 20
                }
            }
            
            const xPos = margin + (col * (imgWidth + imgSpacing))
            
            try {
                doc.addImage(uploadedImages[i], 'JPEG', xPos, yPos, imgWidth, imgHeight)
                doc.setDrawColor(200, 200, 200)
                doc.roundedRect(xPos, yPos, imgWidth, imgHeight, 2, 2)
                
                // Label foto
                doc.setFontSize(8)
                doc.setTextColor(100, 100, 100)
                doc.text(`Foto ${i + 1}`, xPos + (imgWidth / 2), yPos + imgHeight + 5, { align: 'center' })
            } catch (error) {
                console.error('Error adding image:', error)
            }
        }
        
        yPos += imgHeight + 15
    }
    
    // Footer dengan garis
    const finalY = Math.min(yPos + 30, pageHeight - 20)
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, finalY, pageWidth - margin, finalY)
    
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text('Dokumen ini dibuat secara otomatis melalui sistem pelaporan', pageWidth / 2, finalY + 5, { align: 'center' })
    
    // Menyimpan file PDF dengan nama file dinamis
    doc.save(`Laporan_${namaPeralatan.replace(/ /g, '_')}_${tanggal}.pdf`)

    // Memberi umpan balik kepada pengguna
    pesanEl.textContent = 'PDF berhasil dibuat dan diunduh!'
    pesanEl.className = 'text-center text-green-600 dark:text-green-400 mt-4'
})
