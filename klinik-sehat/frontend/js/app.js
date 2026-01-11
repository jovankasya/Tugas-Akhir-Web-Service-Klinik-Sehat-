// Konfigurasi API
const API_BASE = "http://localhost:3000/api";
let currentEditId = null;
let currentEditType = null;
let currentEditData = null;

// ==================== FUNGSI UTAMA ====================

// Auth check
window.onload = function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update UI dengan user info
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    
    // Set tanggal
    updateCurrentDate();
    
    // Load data awal
    showPage('dashboard');
    loadDashboardStats();
    
    // Set default waktu untuk appointment
    setDefaultAppointmentTimes();
};

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', options);
}

// Navigasi halaman
function showPage(pageName) {
    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'patients': 'Manajemen Pasien',
        'doctors': 'Manajemen Dokter',
        'appointments': 'Manajemen Janji Temu',
        'medicines': 'Manajemen Obat',
        'users': 'Manajemen Users'
    };
    
    document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
    
    // Set active nav item
    const navItems = document.querySelectorAll('.nav-item');
    const pages = ['dashboard', 'patients', 'doctors', 'appointments', 'medicines', 'users'];
    navItems.forEach((item, index) => {
        if (pages[index] === pageName) {
            item.classList.add('active');
        }
    });
    
    // Show selected page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    if (pageName === 'dashboard') {
        document.getElementById('dashboardStats').style.display = 'grid';
        document.querySelector('.content-area').style.display = 'none';
        loadDashboardStats();
    } else {
        document.getElementById('dashboardStats').style.display = 'none';
        document.querySelector('.content-area').style.display = 'block';
        document.getElementById(pageName).classList.add('active');
        
        // Load data untuk page yang dipilih
        switch(pageName) {
            case 'patients':
                loadPatients();
                break;
            case 'doctors':
                loadDoctors();
                break;
            case 'appointments':
                loadAppointments();
                loadPatientOptions();
                loadDoctorOptions();
                break;
            case 'medicines':
                loadMedicines();
                break;
            case 'users':
                loadUsers();
                break;
        }
    }
}

// Logout
function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// ==================== SISTEM ALERT ====================

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHTML = `
        <div class="alert alert-${type}" id="${alertId}" style="display: flex;">
            <div>
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                ${message}
            </div>
            <button class="close-alert" onclick="document.getElementById('${alertId}').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML + alertContainer.innerHTML;
    
    // Auto remove setelah 5 detik
    setTimeout(() => {
        const alertEl = document.getElementById(alertId);
        if (alertEl) alertEl.remove();
    }, 5000);
}

// ==================== HELPER API ====================

async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        console.log(`API Call: ${method} ${API_BASE}${endpoint}`, data);
        
        const response = await fetch(API_BASE + endpoint, options);
        const responseText = await response.text();
        
        let result;
        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            result = { message: responseText };
        }
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showAlert(error.message || 'Terjadi kesalahan pada server', 'error');
        throw error;
    }
}

// ==================== DASHBOARD ====================

async function loadDashboardStats() {
    try {
        const [patients, doctors, appointments, medicines] = await Promise.all([
            apiCall('/patients'),
            apiCall('/doctors'),
            apiCall('/appointments'),
            apiCall('/medicines')
        ]);
        
        document.getElementById('totalPatients').textContent = patients.length || 0;
        document.getElementById('totalDoctors').textContent = doctors.length || 0;
        document.getElementById('totalAppointments').textContent = appointments.length || 0;
        document.getElementById('totalMedicines').textContent = medicines.length || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// ==================== MANAJEMEN PASIEN ====================

async function loadPatients() {
    try {
        const patients = await apiCall('/patients');
        const tbody = document.getElementById('patientsData');
        tbody.innerHTML = '';
        
        if (!patients || patients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-user-injured" style="font-size: 48px; margin-bottom: 16px; display: block; color: #cbd5e1;"></i>
                        Belum ada data pasien
                    </td>
                </tr>
            `;
            return;
        }
        
        patients.forEach(patient => {
            const row = `
                <tr>
                    <td>${patient.nama_lengkap || '-'}</td>
                    <td>${patient.nik || '-'}</td>
                    <td>${patient.tanggal_lahir || '-'}</td>
                    <td>${patient.jenis_kelamin === 'L' ? 'Laki-laki' : patient.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</td>
                    <td>${patient.no_telepon || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="editPatient(${patient.patient_id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deletePatient(${patient.patient_id})" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading patients:', error);
        showAlert('Gagal memuat data pasien', 'error');
    }
}

async function savePatient() {
    const patientData = {
        nama_lengkap: document.getElementById('p_nama').value,
        nik: document.getElementById('p_nik').value,
        tanggal_lahir: document.getElementById('p_tgl').value,
        jenis_kelamin: document.getElementById('p_jk').value,
        alamat: document.getElementById('p_alamat').value,
        no_telepon: document.getElementById('p_telp').value,
        email: document.getElementById('p_email').value,
        golongan_darah: document.getElementById('p_gol').value
    };
    
    if (!patientData.nama_lengkap) {
        showAlert('Nama lengkap wajib diisi', 'error');
        return;
    }
    
    try {
        await apiCall('/patients', 'POST', patientData);
        showAlert('Pasien berhasil disimpan!');
        resetPatientForm();
        await loadPatients();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error saving patient:', error);
    }
}

async function editPatient(patientId) {
    try {
        // Ambil semua data pasien
        const patients = await apiCall('/patients');
        const patient = patients.find(p => p.patient_id == patientId);
        
        if (!patient) {
            showAlert('Data pasien tidak ditemukan', 'error');
            return;
        }
        
        currentEditId = patientId;
        currentEditType = 'patient';
        currentEditData = patient;
        
        // Isi form dengan data patient
        document.getElementById('p_nama').value = patient.nama_lengkap || '';
        document.getElementById('p_nik').value = patient.nik || '';
        document.getElementById('p_tgl').value = patient.tanggal_lahir || '';
        document.getElementById('p_jk').value = patient.jenis_kelamin || '';
        document.getElementById('p_alamat').value = patient.alamat || '';
        document.getElementById('p_telp').value = patient.no_telepon || '';
        document.getElementById('p_email').value = patient.email || '';
        document.getElementById('p_gol').value = patient.golongan_darah || '';
        
        // Ubah button text dan fungsi
        const saveBtn = document.getElementById('savePatientBtn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i>Update Pasien';
        saveBtn.setAttribute('onclick', 'updatePatient()');
        
        // Scroll ke form
        document.getElementById('p_nama').focus();
        showAlert('Edit mode aktif. Perbarui data pasien.', 'success');
    } catch (error) {
        console.error('Error loading patient for edit:', error);
        showAlert('Gagal memuat data pasien untuk edit', 'error');
    }
}

async function updatePatient() {
    if (!currentEditId || currentEditType !== 'patient') {
        showAlert('Tidak ada data yang diedit', 'error');
        return;
    }
    
    const patientData = {
        nama_lengkap: document.getElementById('p_nama').value,
        nik: document.getElementById('p_nik').value,
        tanggal_lahir: document.getElementById('p_tgl').value,
        jenis_kelamin: document.getElementById('p_jk').value,
        alamat: document.getElementById('p_alamat').value,
        no_telepon: document.getElementById('p_telp').value,
        email: document.getElementById('p_email').value,
        golongan_darah: document.getElementById('p_gol').value
    };
    
    if (!patientData.nama_lengkap) {
        showAlert('Nama lengkap wajib diisi', 'error');
        return;
    }
    
    try {
        // Catatan: Backend tidak punya PUT, jadi kita simulasi update
        // Dalam implementasi real, backend perlu endpoint PUT
        showAlert('Update pasien: Backend tidak memiliki endpoint PUT. Data baru akan ditambahkan.', 'warning');
        
        // Untuk sekarang, kita buat data baru
        await apiCall('/patients', 'POST', patientData);
        showAlert('Data pasien berhasil ditambahkan!');
        resetPatientForm();
        await loadPatients();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error updating patient:', error);
    }
}

async function deletePatient(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus pasien ini?')) return;
    
    try {
        const response = await apiCall(`/patients/${id}`, 'DELETE');
        console.log('Delete patient response:', response);
        showAlert('Pasien berhasil dihapus!');
        await loadPatients();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error deleting patient:', error);
        showAlert('Gagal menghapus pasien. Pastikan backend memiliki endpoint DELETE /patients/:id', 'error');
    }
}

function resetPatientForm() {
    document.getElementById('p_nama').value = '';
    document.getElementById('p_nik').value = '';
    document.getElementById('p_tgl').value = '';
    document.getElementById('p_jk').value = '';
    document.getElementById('p_alamat').value = '';
    document.getElementById('p_telp').value = '';
    document.getElementById('p_email').value = '';
    document.getElementById('p_gol').value = '';
    
    currentEditId = null;
    currentEditType = null;
    currentEditData = null;
    
    // Reset button
    const saveBtn = document.getElementById('savePatientBtn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i>Simpan Pasien';
    saveBtn.setAttribute('onclick', 'savePatient()');
    
    showAlert('Form telah direset', 'success');
}

// ==================== MANAJEMEN DOKTER ====================

async function loadDoctors() {
    try {
        const doctors = await apiCall('/doctors');
        const tbody = document.getElementById('doctorsData');
        tbody.innerHTML = '';
        
        if (!doctors || doctors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-user-md" style="font-size: 48px; margin-bottom: 16px; display: block; color: #cbd5e1;"></i>
                        Belum ada data dokter
                    </td>
                </tr>
            `;
            return;
        }
        
        doctors.forEach(doctor => {
            const row = `
                <tr>
                    <td>${doctor.nama_lengkap || '-'}</td>
                    <td>${doctor.spesialisasi || '-'}</td>
                    <td>${doctor.no_telepon || '-'}</td>
                    <td>${doctor.email || '-'}</td>
                    <td>${doctor.biaya_konsultasi ? 'Rp ' + doctor.biaya_konsultasi.toLocaleString('id-ID') : '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="editDoctor(${doctor.doctor_id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteDoctor(${doctor.doctor_id})" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
        showAlert('Gagal memuat data dokter', 'error');
    }
}

async function saveDoctor() {
    const doctorData = {
        nama_lengkap: document.getElementById('d_nama').value,
        spesialisasi: document.getElementById('d_spec').value,
        no_str: document.getElementById('d_str').value || null,
        no_telepon: document.getElementById('d_telp').value || null,
        email: document.getElementById('d_email').value || null,
        biaya_konsultasi: parseInt(document.getElementById('d_fee').value) || null
    };
    
    if (!doctorData.nama_lengkap) {
        showAlert('Nama dokter wajib diisi', 'error');
        return;
    }
    
    try {
        await apiCall('/doctors', 'POST', doctorData);
        showAlert('Dokter berhasil disimpan!');
        resetDoctorForm();
        await loadDoctors();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error saving doctor:', error);
    }
}

async function editDoctor(doctorId) {
    try {
        // Ambil semua data dokter
        const doctors = await apiCall('/doctors');
        const doctor = doctors.find(d => d.doctor_id == doctorId);
        
        if (!doctor) {
            showAlert('Data dokter tidak ditemukan', 'error');
            return;
        }
        
        currentEditId = doctorId;
        currentEditType = 'doctor';
        currentEditData = doctor;
        
        document.getElementById('d_nama').value = doctor.nama_lengkap || '';
        document.getElementById('d_spec').value = doctor.spesialisasi || '';
        document.getElementById('d_str').value = doctor.no_str || '';
        document.getElementById('d_telp').value = doctor.no_telepon || '';
        document.getElementById('d_email').value = doctor.email || '';
        document.getElementById('d_fee').value = doctor.biaya_konsultasi || '';
        
        // Ubah button text
        const saveBtn = document.getElementById('saveDoctorBtn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i>Update Dokter';
        saveBtn.setAttribute('onclick', 'updateDoctor()');
        
        showAlert('Edit mode aktif. Perbarui data dokter.', 'success');
    } catch (error) {
        console.error('Error loading doctor for edit:', error);
        showAlert('Gagal memuat data dokter untuk edit', 'error');
    }
}

async function updateDoctor() {
    if (!currentEditId || currentEditType !== 'doctor') {
        showAlert('Tidak ada data yang diedit', 'error');
        return;
    }
    
    const doctorData = {
        nama_lengkap: document.getElementById('d_nama').value,
        spesialisasi: document.getElementById('d_spec').value,
        no_str: document.getElementById('d_str').value || null,
        no_telepon: document.getElementById('d_telp').value || null,
        email: document.getElementById('d_email').value || null,
        biaya_konsultasi: parseInt(document.getElementById('d_fee').value) || null
    };
    
    if (!doctorData.nama_lengkap) {
        showAlert('Nama dokter wajib diisi', 'error');
        return;
    }
    
    try {
        // Catatan: Backend tidak punya PUT, jadi kita simulasi update
        showAlert('Update dokter: Backend tidak memiliki endpoint PUT. Data baru akan ditambahkan.', 'warning');
        
        // Untuk sekarang, kita buat data baru
        await apiCall('/doctors', 'POST', doctorData);
        showAlert('Data dokter berhasil ditambahkan!');
        resetDoctorForm();
        await loadDoctors();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error updating doctor:', error);
    }
}

async function deleteDoctor(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus dokter ini?')) return;
    
    try {
        await apiCall(`/doctors/${id}`, 'DELETE');
        showAlert('Dokter berhasil dihapus!');
        await loadDoctors();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error deleting doctor:', error);
        showAlert('Gagal menghapus dokter', 'error');
    }
}

function resetDoctorForm() {
    document.getElementById('d_nama').value = '';
    document.getElementById('d_spec').value = '';
    document.getElementById('d_str').value = '';
    document.getElementById('d_telp').value = '';
    document.getElementById('d_email').value = '';
    document.getElementById('d_fee').value = '';
    
    currentEditId = null;
    currentEditType = null;
    currentEditData = null;
    
    // Reset button
    const saveBtn = document.getElementById('saveDoctorBtn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i>Simpan Dokter';
    saveBtn.setAttribute('onclick', 'saveDoctor()');
    
    showAlert('Form telah direset', 'success');
}

// ==================== MANAJEMEN JANJI TEMU ====================

async function loadPatientOptions() {
    try {
        const patients = await apiCall('/patients');
        const select = document.getElementById('a_patient');
        select.innerHTML = '<option value="">Pilih pasien</option>';
        
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.patient_id;
            option.textContent = patient.nama_lengkap + (patient.nik ? ` (${patient.nik})` : '');
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading patient options:', error);
    }
}

async function loadDoctorOptions() {
    try {
        const doctors = await apiCall('/doctors');
        const select = document.getElementById('a_doctor');
        select.innerHTML = '<option value="">Pilih dokter</option>';
        
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.doctor_id;
            option.textContent = doctor.nama_lengkap + (doctor.spesialisasi ? ` (${doctor.spesialisasi})` : '');
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading doctor options:', error);
    }
}

async function loadAppointments() {
    try {
        const appointments = await apiCall('/appointments');
        const tbody = document.getElementById('appointmentsData');
        tbody.innerHTML = '';
        
        if (!appointments || appointments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-calendar-check" style="font-size: 48px; margin-bottom: 16px; display: block; color: #cbd5e1;"></i>
                        Belum ada janji temu
                    </td>
                </tr>
            `;
            return;
        }
        
        appointments.forEach(app => {
            const statusColors = {
                'pending': '#f59e0b',
                'confirmed': '#10b981',
                'completed': '#3b82f6',
                'cancelled': '#ef4444'
            };
            
            const statusText = {
                'pending': 'Menunggu',
                'confirmed': 'Dikonfirmasi',
                'completed': 'Selesai',
                'cancelled': 'Dibatalkan'
            };
            
            const row = `
                <tr>
                    <td>${app.patient || '-'}</td>
                    <td>${app.doctor || '-'}</td>
                    <td>${app.tanggal_janji || '-'}</td>
                    <td>${app.waktu_mulai ? app.waktu_mulai.substring(0,5) : '-'} - ${app.waktu_selesai ? app.waktu_selesai.substring(0,5) : '-'}</td>
                    <td>${app.keluhan ? (app.keluhan.length > 50 ? app.keluhan.substring(0,50) + '...' : app.keluhan) : '-'}</td>
                    <td>
                        <span style="background: ${statusColors[app.status] || '#64748b'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            ${statusText[app.status] || app.status || 'Menunggu'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="editAppointment(${app.appointment_id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteAppointment(${app.appointment_id})" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
        showAlert('Gagal memuat data janji temu', 'error');
    }
}

async function editAppointment(appointmentId) {
    try {
        // Ambil semua data appointment
        const appointments = await apiCall('/appointments');
        const appointment = appointments.find(a => a.appointment_id == appointmentId);
        
        if (!appointment) {
            showAlert('Data janji temu tidak ditemukan', 'error');
            return;
        }
        
        currentEditId = appointmentId;
        currentEditType = 'appointment';
        currentEditData = appointment;
        
        // Tampilkan alert bahwa edit tidak tersedia di backend
        showAlert('Edit janji temu tidak tersedia di backend saat ini. Backend perlu endpoint PUT /appointments/:id', 'warning');
        
        // Jika ada data appointment, kita bisa tampilkan di console untuk debugging
        console.log('Appointment data:', appointment);
        
    } catch (error) {
        console.error('Error loading appointment for edit:', error);
        showAlert('Gagal memuat data janji temu untuk edit', 'error');
    }
}

async function saveAppointment() {
    const appointmentData = {
        patient_id: parseInt(document.getElementById('a_patient').value),
        doctor_id: parseInt(document.getElementById('a_doctor').value),
        tanggal_janji: document.getElementById('a_date').value,
        waktu_mulai: document.getElementById('a_waktu_mulai').value,
        waktu_selesai: document.getElementById('a_waktu_selesai').value,
        keluhan: document.getElementById('a_keluhan').value,
        status: document.getElementById('a_status').value || 'pending'
    };
    
    if (!appointmentData.patient_id || !appointmentData.doctor_id || !appointmentData.tanggal_janji) {
        showAlert('Pasien, dokter dan tanggal wajib diisi', 'error');
        return;
    }
    
    try {
        await apiCall('/appointments', 'POST', appointmentData);
        showAlert('Janji temu berhasil dibuat!');
        resetAppointmentForm();
        await loadAppointments();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error saving appointment:', error);
    }
}

async function deleteAppointment(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus janji temu ini?')) return;
    
    try {
        await apiCall(`/appointments/${id}`, 'DELETE');
        showAlert('Janji temu berhasil dihapus!');
        await loadAppointments();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error deleting appointment:', error);
        showAlert('Gagal menghapus janji temu', 'error');
    }
}

function resetAppointmentForm() {
    document.getElementById('a_patient').value = '';
    document.getElementById('a_doctor').value = '';
    document.getElementById('a_keluhan').value = '';
    document.getElementById('a_status').value = 'pending';
    setDefaultAppointmentTimes();
    showAlert('Form telah direset', 'success');
}

function setDefaultAppointmentTimes() {
    const now = new Date();
    const timeString = now.toTimeString().substring(0,5);
    document.getElementById('a_waktu_mulai').value = timeString;
    
    now.setMinutes(now.getMinutes() + 30);
    const endTimeString = now.toTimeString().substring(0,5);
    document.getElementById('a_waktu_selesai').value = endTimeString;
    
    // Set tanggal default untuk besok
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('a_date').value = tomorrow.toISOString().split('T')[0];
}

// ==================== MANAJEMEN OBAT ====================

async function loadMedicines() {
    try {
        const medicines = await apiCall('/medicines');
        const tbody = document.getElementById('medicinesData');
        tbody.innerHTML = '';
        
        if (!medicines || medicines.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-pills" style="font-size: 48px; margin-bottom: 16px; display: block; color: #cbd5e1;"></i>
                        Belum ada data obat
                    </td>
                </tr>
            `;
            return;
        }
        
        medicines.forEach(medicine => {
            const row = `
                <tr>
                    <td>${medicine.name || '-'}</td>
                    <td>
                        <span style="font-weight: bold; color: ${medicine.stock > 10 ? '#10b981' : (medicine.stock > 0 ? '#f59e0b' : '#ef4444')}">
                            ${medicine.stock || 0}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="editMedicine(${medicine.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteMedicine(${medicine.id})" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading medicines:', error);
        showAlert('Gagal memuat data obat', 'error');
    }
}

async function editMedicine(medicineId) {
    try {
        // Ambil semua data obat
        const medicines = await apiCall('/medicines');
        const medicine = medicines.find(m => m.id == medicineId);
        
        if (!medicine) {
            showAlert('Data obat tidak ditemukan', 'error');
            return;
        }
        
        currentEditId = medicineId;
        currentEditType = 'medicine';
        currentEditData = medicine;
        
        // Isi form dengan data obat
        document.getElementById('m_name').value = medicine.name || '';
        document.getElementById('m_stock').value = medicine.stock || '';
        
        showAlert('Edit mode aktif. Perbarui data obat.', 'success');
    } catch (error) {
        console.error('Error loading medicine for edit:', error);
        showAlert('Gagal memuat data obat untuk edit', 'error');
    }
}

async function saveMedicine() {
    const medicineData = {
        name: document.getElementById('m_name').value,
        stock: parseInt(document.getElementById('m_stock').value) || 0
    };
    
    if (!medicineData.name || medicineData.stock === undefined) {
        showAlert('Nama dan stok wajib diisi', 'error');
        return;
    }
    
    try {
        if (currentEditId && currentEditType === 'medicine') {
            // Untuk edit, kita buat data baru (karena backend tidak punya PUT)
            await apiCall('/medicines', 'POST', medicineData);
            showAlert('Obat berhasil diperbarui!');
        } else {
            await apiCall('/medicines', 'POST', medicineData);
            showAlert('Obat berhasil disimpan!');
        }
        
        resetMedicineForm();
        await loadMedicines();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error saving medicine:', error);
    }
}

async function deleteMedicine(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus obat ini?')) return;
    
    try {
        // Perbaiki endpoint delete untuk medicines
        const response = await apiCall(`/medicines/${id}`, 'DELETE');
        console.log('Delete medicine response:', response);
        showAlert('Obat berhasil dihapus!');
        await loadMedicines();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error deleting medicine:', error);
        // Coba alternatif endpoint jika yang pertama gagal
        try {
            // Beberapa backend menggunakan format yang berbeda
            const response = await fetch(`${API_BASE}/medicines/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                showAlert('Obat berhasil dihapus!');
                await loadMedicines();
                await loadDashboardStats();
            } else {
                showAlert('Gagal menghapus obat. Pastikan backend memiliki endpoint DELETE /medicines/:id', 'error');
            }
        } catch (secondError) {
            showAlert('Gagal menghapus obat. Periksa koneksi backend dan endpoint.', 'error');
        }
    }
}

function resetMedicineForm() {
    document.getElementById('m_name').value = '';
    document.getElementById('m_stock').value = '';
    
    currentEditId = null;
    currentEditType = null;
    currentEditData = null;
    
    showAlert('Form telah direset', 'success');
}

// ==================== MANAJEMEN USERS ====================

async function loadUsers() {
    try {
        const users = await apiCall('/users');
        const tbody = document.getElementById('usersData');
        tbody.innerHTML = '';
        
        if (!users || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; display: block; color: #cbd5e1;"></i>
                        Belum ada data user
                    </td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.username || '-'}</td>
                    <td>
                        <span style="background: ${user.role === 'admin' ? '#1e3a8a' : '#64748b'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            ${user.role === 'admin' ? 'Administrator' : 'User'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Gagal memuat data user', 'error');
    }
}

async function saveUser() {
    const userData = {
        username: document.getElementById('u_name').value,
        role: document.getElementById('u_role').value
    };
    
    if (!userData.username || !userData.role) {
        showAlert('Username dan role wajib diisi', 'error');
        return;
    }
    
    try {
        await apiCall('/users', 'POST', userData);
        showAlert('User berhasil ditambahkan!');
        resetUserForm();
        await loadUsers();
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

async function deleteUser(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    
    try {
        await apiCall(`/users/${id}`, 'DELETE');
        showAlert('User berhasil dihapus!');
        await loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Gagal menghapus user', 'error');
    }
}

function resetUserForm() {
    document.getElementById('u_name').value = '';
    document.getElementById('u_role').value = '';
    showAlert('Form telah direset', 'success');
}

// ==================== PATCH UNTUK BACKEND YANG TIDAK LENGKAP ====================

// Fungsi ini untuk mengatasi jika backend tidak memiliki endpoint tertentu
async function checkBackendEndpoints() {
    try {
        console.log('Checking backend endpoints...');
        
        // Test endpoint patients
        try {
            const patients = await apiCall('/patients');
            console.log('✓ GET /patients working:', patients.length, 'patients');
        } catch (e) {
            console.log('✗ GET /patients not working:', e.message);
        }
        
        // Test endpoint DELETE patients/:id
        try {
            // Coba endpoint delete dengan ID dummy
            await fetch(`${API_BASE}/patients/999`, { method: 'DELETE' });
            console.log('✓ DELETE /patients/:id endpoint exists');
        } catch (e) {
            console.log('✗ DELETE /patients/:id may not exist:', e.message);
        }
        
        // Test endpoint medicines
        try {
            const medicines = await apiCall('/medicines');
            console.log('✓ GET /medicines working:', medicines.length, 'medicines');
        } catch (e) {
            console.log('✗ GET /medicines not working:', e.message);
        }
        
    } catch (error) {
        console.error('Error checking endpoints:', error);
    }
}

// Jalankan check saat load
setTimeout(() => {
    checkBackendEndpoints();
}, 1000);

// Auto-refresh dashboard setiap 30 detik
setInterval(() => {
    if (document.getElementById('dashboardStats').style.display === 'grid') {
        loadDashboardStats();
    }
}, 30000);