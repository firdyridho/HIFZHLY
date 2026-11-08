package service

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/redis/go-redis/v9"
)

type PrayerTimesService interface {
	GetPrayerTimes(ctx context.Context, city string) (*model.PrayerTimesResponse, error)
}

type prayerTimesService struct {
	redisClient *redis.Client
}

func NewPrayerTimesService(redisClient *redis.Client) PrayerTimesService {
	return &prayerTimesService{redisClient: redisClient}
}

func (s *prayerTimesService) GetPrayerTimes(ctx context.Context, city string) (*model.PrayerTimesResponse, error) {
	if city == "" {
		city = "Serang, Banten"
	}

	loc, _ := time.LoadLocation("Asia/Jakarta")
	if loc == nil {
		loc = time.FixedZone("WIB", 7*3600)
	}
	now := time.Now().In(loc)

	// Koordinat Serang Banten: Lat: -6.12, Long: 106.15
	lat := -6.12
	lng := 106.15
	timezone := 7.0

	schedules := calculateIndonesianPrayerTimes(now, lat, lng, timezone)

	return &model.PrayerTimesResponse{
		City:      city,
		Date:      now.Format("2006-01-02"),
		Schedules: schedules,
	}, nil
}

// calculateIndonesianPrayerTimes menghitung jadwal sholat akurat standar Kemenag RI
// (Fajr: 20 derajat, Isha: 18 derajat, Ihtiyat: +2 menit)
func calculateIndonesianPrayerTimes(date time.Time, lat, lng, timezone float64) []model.PrayerScheduleItem {
	dayOfYear := float64(date.YearDay())

	// Sudut perkiraan rotasi matahari
	b := 2.0 * math.Pi * (dayOfYear - 81.0) / 365.0

	// Equation of Time (EoT) dalam menit
	eot := 9.87*math.Sin(2.0*b) - 7.53*math.Cos(b) - 1.5*math.Sin(b)

	// Deklinasi matahari (delta) dalam derajat
	declination := 23.45 * math.Sin(2.0*math.Pi*(284.0+dayOfYear)/365.0)
	declRad := declination * math.Pi / 180.0
	latRad := lat * math.Pi / 180.0

	// Waktu transit matahari (Dzuhur) dalam jam desimal
	// Dzuhur = 12 + Timezone - (Longitude / 15) - (EoT / 60)
	dzuhurHour := 12.0 + timezone - (lng / 15.0) - (eot / 60.0) + (2.0 / 60.0) // +2 menit ihtiyat

	// Helper menghitung hour angle untuk sudut matahari tertentu
	hourAngle := func(altitudeDeg float64) float64 {
		altRad := altitudeDeg * math.Pi / 180.0
		cosH := (math.Sin(altRad) - math.Sin(latRad)*math.Sin(declRad)) / (math.Cos(latRad) * math.Cos(declRad))
		if cosH > 1.0 {
			cosH = 1.0
		} else if cosH < -1.0 {
			cosH = -1.0
		}
		return math.Acos(cosH) * 180.0 / math.Pi / 15.0
	}

	// 1. Shubuh: Kemenag altitude = -20 derajat
	hFajr := hourAngle(-20.0)
	fajrHour := dzuhurHour - hFajr + (2.0 / 60.0)

	// 2. Ashar: panjang bayangan = panjang benda + bayangan saat dzuhur (Syafi'i)
	// cot(alt) = 1 + tan(|lat - decl|)
	zenithRad := math.Abs(latRad - declRad)
	asharAltRad := math.Atan(1.0 / (1.0 + math.Tan(zenithRad)))
	asharAltDeg := asharAltRad * 180.0 / math.Pi
	hAshar := hourAngle(asharAltDeg)
	asharHour := dzuhurHour + hAshar + (2.0 / 60.0)

	// 3. Maghrib: matahari terbenam (altitude = -0.8333 derajat + refraction)
	hMaghrib := hourAngle(-0.8333)
	maghribHour := dzuhurHour + hMaghrib + (2.0 / 60.0)

	// 4. Isya: Kemenag altitude = -18 derajat
	hIsha := hourAngle(-18.0)
	ishaHour := dzuhurHour + hIsha + (2.0 / 60.0)

	formatTime := func(decimalHours float64) (string, int, int) {
		for decimalHours < 0 {
			decimalHours += 24
		}
		for decimalHours >= 24 {
			decimalHours -= 24
		}
		h := int(math.Floor(decimalHours))
		m := int(math.Round((decimalHours - float64(h)) * 60.0))
		if m >= 60 {
			h = (h + 1) % 24
			m = 0
		}
		return fmt.Sprintf("%02d:%02d", h, m), h, m
	}

	shubuhStr, shH, shM := formatTime(fajrHour)
	dzuhurStr, dzH, dzM := formatTime(dzuhurHour)
	asharStr, asH, asM := formatTime(asharHour)
	maghribStr, mgH, mgM := formatTime(maghribHour)
	isyaStr, isH, isM := formatTime(ishaHour)

	return []model.PrayerScheduleItem{
		{Name: "Shubuh", Time: shubuhStr, Hours: shH, Minutes: shM},
		{Name: "Dzuhur", Time: dzuhurStr, Hours: dzH, Minutes: dzM},
		{Name: "Ashar", Time: asharStr, Hours: asH, Minutes: asM},
		{Name: "Maghrib", Time: maghribStr, Hours: mgH, Minutes: mgM},
		{Name: "Isya", Time: isyaStr, Hours: isH, Minutes: isM},
	}
}
