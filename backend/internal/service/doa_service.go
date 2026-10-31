package service

import (
	"context"

	"github.com/fifa-team/hifzhly-backend/internal/model"
)

type DoaService interface {
	GetAllDoa(ctx context.Context) ([]model.DoaItem, error)
}

type doaService struct {
	items []model.DoaItem
}

func NewDoaService() DoaService {
	items := []model.DoaItem{
		{
			ID:          "doa-sebelum-murojaah",
			Title:       "Doa Sebelum Menghafal & Murojaah",
			Category:    "sebelum_murojaah",
			Arabic:      "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
			Latin:       "Rabbisyrah lii shadrii, wa yassir lii amrii, wahlul 'uqdatan mil lisaanii, yafqahuu qawlii.",
			Translation: "Ya Tuhanku, lapangkanlah dadaku, dan mudahkanlah untukku urusanku, dan lepaskanlah kekakuan dari lidahku, agar mereka mengerti perkataanku.",
			Fadhilah:    "QS. Thaha: 25-28. Doa Nabi Musa AS memohon kelancaran lisan dan ketenangan hati dalam menyampaikan dan menghafalkan kalamullah.",
		},
		{
			ID:          "doa-mohon-ketetapan-hafalan",
			Title:       "Doa Memohon Ingatan & Ketetapan Hafalan",
			Category:    "sesudah_murojaah",
			Arabic:      "اللَّهُمَّ ذَكِّرْنَا مِنْهُ مَا نَسِينَا وَعَلِّمْنَا مِنْهُ مَا جَهِلْنَا وَارْزُقْنَا تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ",
			Latin:       "Allahumma dzakkirnaa minhu maa nasiinaa, wa 'allimnaa minhu maa jahilnaa, warzuqnaa tilaawatahu aanaa-al layli wa athraafan nahaar.",
			Translation: "Ya Allah, ingatkanlah kami apa yang kami lupa dari Al-Qur'an, ajarkanlah kami apa yang belum kami ketahui darinya, dan anugerahkanlah kami kemampuan membacanya sepanjang malam dan di ujung-ujung siang.",
			Fadhilah:    "Doa masyhur ahlul Qur'an memohon penjagaan ayat-ayat yang telah dihafal agar tidak pudar dari ingatan.",
		},
		{
			ID:          "doa-tambah-ilmu-pemahaman",
			Title:       "Doa Tambah Ilmu & Kekuatan Pemahaman",
			Category:    "harian",
			Arabic:      "رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا وَاجْعَلْنِي مِنَ الصَّالِحِينَ",
			Latin:       "Rabbi zidnii 'ilman, warzuqnii fahman, waj'alnii minash-shaalihiin.",
			Translation: "Ya Tuhanku, tambahkanlah ilmu kepadaku, dan berilah aku karunia untuk memahaminya, serta jadikanlah aku termasuk golongan orang-orang yang saleh.",
			Fadhilah:    "Doa memohon keterbukaan akal dan hati dalam memahami makna ayat serta kaidah tajwid Al-Qur'an.",
		},
		{
			ID:          "doa-khatam-quran",
			Title:       "Doa Khotmil Qur'an (Keberkahan Al-Qur'an)",
			Category:    "khatam",
			Arabic:      "اللَّهُمَّ ارْحَمْنَا بِالْقُرْآنِ وَاجْعَلْهُ لَنَا إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً",
			Latin:       "Allahummar-hamnaa bil-qur'aan, waj'alhu lanaa imaaman wa nuuran wa hudan wa rahmah.",
			Translation: "Ya Allah, limpahkanlah rahmat kepada kami dengan Al-Qur'an, dan jadikanlah ia sebagai pemimpin, cahaya, petunjuk, dan rahmat bagi kami.",
			Fadhilah:    "Doa agung para sahabat dan tabi'in seusai menyelesaikan tilawah dan murojaah Al-Qur'an.",
		},
	}
	return &doaService{items: items}
}

func (s *doaService) GetAllDoa(ctx context.Context) ([]model.DoaItem, error) {
	return s.items, nil
}
