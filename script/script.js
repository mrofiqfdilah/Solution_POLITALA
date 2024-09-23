// Mengambil data jadwal dari file JSON dan menampilkannya
fetch('./json/schedule_data.json')
    .then(response => response.json()) // Parsing file JSON menjadi objek JavaScript
    .then(data => {
        // Mendapatkan elemen HTML berdasarkan id
        const isiJadwal = document.getElementById('isi-jadwal');
        const kelasPilihan = document.getElementById('kelas-pilihan');
        const inputCari = document.getElementById('input-cari');
        const tombolCari = document.getElementById('tombol-cari');

        // Mengisi opsi pilihan kelas dari data JSON
        Object.keys(data.kelas).forEach(kelas => {
            const opsi = document.createElement('option'); // Membuat elemen <option>
            opsi.value = kelas; // Menetapkan value sebagai nama kelas
            opsi.textContent = kelas; // Menetapkan teks yang akan ditampilkan
            kelasPilihan.appendChild(opsi); // Menambahkan opsi ke dropdown kelas
        });

        // Fungsi untuk menampilkan jadwal berdasarkan kelas yang dipilih
        function tampilkanJadwal(kelasDipilih) {
            isiJadwal.innerHTML = ''; // Mengosongkan isi jadwal sebelumnya

            const jadwal = data.kelas[kelasDipilih]; // Mendapatkan jadwal untuk kelas yang dipilih
            const jadwalTergrup = {}; // Objek untuk menyimpan jadwal tergrup berdasarkan hari

            // Mengelompokkan jadwal berdasarkan hari
            jadwal.forEach(item => {
                if (!jadwalTergrup[item.hari]) {
                    jadwalTergrup[item.hari] = []; // Inisialisasi array untuk setiap hari
                }
                // Menambahkan pelajaran dan waktu ke jadwal untuk hari tersebut
                jadwalTergrup[item.hari].push({
                    pelajaran: item.mata_pelajaran,
                    waktu: item.waktu
                });
            });

            // Menampilkan jadwal per hari
            Object.keys(jadwalTergrup).forEach(hari => {
                const dayDiv = document.createElement('div');
                dayDiv.classList.add('day'); // Menambahkan class 'day' untuk elemen hari

                const dateDiv = document.createElement('div');
                dateDiv.classList.add('date');
                dateDiv.textContent = hari; // Menampilkan nama hari

                const eventDiv = document.createElement('div'); // Container untuk pelajaran dalam hari tersebut
                jadwalTergrup[hari].forEach(item => {
                    const pelajaranDiv = document.createElement('div');
                    pelajaranDiv.classList.add('event'); // Menambahkan class 'event' untuk setiap pelajaran

                    const waktuDiv = document.createElement('div');
                    waktuDiv.classList.add('event-time');
                    waktuDiv.textContent = item.waktu; // Menampilkan waktu pelajaran

                    const pelajaranNamaDiv = document.createElement('div');
                    pelajaranNamaDiv.textContent = item.pelajaran; // Menampilkan nama pelajaran

                    // Menambahkan elemen waktu dan nama pelajaran ke dalam container pelajaran
                    pelajaranDiv.appendChild(waktuDiv);
                    pelajaranDiv.appendChild(pelajaranNamaDiv);
                    eventDiv.appendChild(pelajaranDiv);
                });

                // Ikon untuk membacakan jadwal
                const iconSuara = document.createElement('i');
                iconSuara.classList.add('fas', 'fa-volume-up', 'icon-suara');
                // Menambahkan event listener untuk ikon suara
                iconSuara.addEventListener('click', () => {
                    bacakanJadwal(jadwalTergrup[hari]); // Memanggil fungsi bacakan jadwal
                });

                // Menambahkan elemen hari, ikon suara, dan pelajaran ke dalam isi jadwal
                dayDiv.appendChild(dateDiv);
                dayDiv.appendChild(iconSuara);
                dayDiv.appendChild(eventDiv);
                isiJadwal.appendChild(dayDiv);
            });
        }

        // Fungsi untuk membacakan jadwal menggunakan Web Speech API
        function bacakanJadwal(jadwalHari) {
            jadwalHari.forEach(item => {
                const text = item.pelajaran + item.waktu; // Menggabungkan teks pelajaran dan waktu
                const speech = new SpeechSynthesisUtterance(text); // Membuat objek untuk membaca teks
                speech.lang = 'id-ID'; // Bahasa Indonesia
                window.speechSynthesis.speak(speech); // Memulai pembacaan teks
            });
        }

        // Menampilkan jadwal awal sesuai dengan kelas yang dipilih pertama kali
        tampilkanJadwal(kelasPilihan.value);

        // Update jadwal ketika kelas dipilih dari dropdown
        kelasPilihan.addEventListener('change', function() {
            tampilkanJadwal(this.value); // Memperbarui jadwal sesuai kelas yang dipilih
        });

        // Event listener untuk pencarian berdasarkan tombol cari
        tombolCari.addEventListener('click', function() {
            const kataKunci = inputCari.value.trim(); // Mengambil input pencarian dan menghilangkan spasi
            if (kataKunci === '' || /[^a-zA-Z\s]/.test(kataKunci)) { // Validasi input hanya huruf
                swal({
                    title: "Input Tidak Valid!",
                    text: "Hanya diperbolehkan huruf",
                    icon: "warning",
                    button: "OK"
                });
                inputCari.value = ''; // Mengosongkan input pencarian
                return;
            }
            cariPelajaran(kataKunci); // Panggil fungsi pencarian pelajaran
        });

        // Fungsi untuk mencari mata pelajaran berdasarkan keyword
        function cariPelajaran(kataKunci) {
            const jadwal = document.getElementsByClassName('day');
            let ditemukan = false;

            // Menghapus hasil pencarian sebelumnya jika ada
            const barisTidakAdaHasil = document.getElementById('tidak-ada-hasil');
            if (barisTidakAdaHasil) {
                barisTidakAdaHasil.remove();
            }

            // Mengubah keyword menjadi lowercase untuk pencarian
            const kataKunciLower = kataKunci.toLowerCase();

            // Looping melalui jadwal dan mencari pelajaran yang sesuai
            for (let i = 0; i < jadwal.length; i++) {
                const selPelajaran = jadwal[i].getElementsByClassName('event');
                let adaPelajaran = false;

                // Mencari pelajaran yang cocok dengan keyword
                for (let j = 0; j < selPelajaran.length; j++) {
                    const pelajaranNama = selPelajaran[j].textContent.toLowerCase();
                    if (pelajaranNama.includes(kataKunciLower)) {
                        adaPelajaran = true;
                        break;
                    }
                }

                // Menampilkan atau menyembunyikan hari berdasarkan hasil pencarian
                if (adaPelajaran) {
                    jadwal[i].style.display = 'block';
                    ditemukan = true;
                } else {
                    jadwal[i].style.display = 'none';
                }
            }

            // Jika tidak ada hasil ditemukan, tampilkan pesan "Tidak ada hasil"
            if (!ditemukan) {
                const tidakAdaHasilDiv = document.createElement('div');
                tidakAdaHasilDiv.id = 'tidak-ada-hasil';
                tidakAdaHasilDiv.classList.add('tidak-ada-hasil');

                const teksTidakAdaHasil = document.createElement('p');
                teksTidakAdaHasil.textContent = 'Tidak ada hasil ditemukan';

                const gambar404 = document.createElement('img');
                gambar404.src = './image/notfound.png';  // Path ke gambar 404
                gambar404.alt = '404 Not Found';
                gambar404.style.width = '400px'; // Ukuran gambar

                // Menambahkan elemen teks dan gambar ke dalam div
                tidakAdaHasilDiv.appendChild(gambar404);
                tidakAdaHasilDiv.appendChild(teksTidakAdaHasil);

                // Menambahkan div ke dalam jadwal
                isiJadwal.appendChild(tidakAdaHasilDiv);
            }
        }
    })
    .catch(error => console.error('terjadi eror pada json:', error)); // Menangani kesalahan saat memuat file JSON

    document.getElementById('burger-menu').addEventListener('click', function() {
        const navMenu = document.getElementById('nav-menu');
        navMenu.classList.toggle('active'); // Tambahkan atau hapus kelas aktif
    });
    