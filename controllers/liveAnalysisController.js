const classroomData = require('../store/classroomStore');
const timetableData = require('../store/timetableStore');

const TIME_ZONE = 'Asia/Kolkata';

function getLatestRecord(room_id) {
    const records = classroomData.filter((record) => record.room_id === room_id);
    if (records.length === 0) return null;
    return records[records.length - 1];
}

function getLiveIndiaTime() {
    const now = new Date();

    const parts = new Intl.DateTimeFormat('en-IN', {
        timeZone: TIME_ZONE,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(now);

    const getPart = (type) => parts.find((p) => p.type === type)?.value;

    const day = getPart('weekday').toLowerCase();
    const hour = getPart('hour');
    const minute = getPart('minute');

    return {
        day,
        currentTime: `${hour}:${minute}`,
        timezone: TIME_ZONE
    };
}

function isTimeInsideSlot(currentTime, startTime, endTime) {
    return currentTime >= startTime && currentTime < endTime;
}

function getLiveScheduleStatus(room_id) {
    const { day, currentTime, timezone } = getLiveIndiaTime();

    const roomTimetables = timetableData.filter(
        (item) => item.room_id === room_id && item.day === day
    );

    for (const timetable of roomTimetables) {
        for (const slot of timetable.slots) {
            if (isTimeInsideSlot(currentTime, slot.start_time, slot.end_time)) {
                return {
                    schedule_status: 'active',
                    matched_slot: slot,
                    live_day: day,
                    live_time: currentTime,
                    timezone
                };
            }
        }
    }

    return {
        schedule_status: 'inactive',
        matched_slot: null,
        live_day: day,
        live_time: currentTime,
        timezone
    };
}

function isLiveDaytime(liveTime) {
    const hour = Number(liveTime.split(':')[0]);
    return hour >= 6 && hour < 17;
}

function getExpectedDeviceState({ occupancy, is_daytime, schedule_status }) {
    if (occupancy === 0) {
        return { lights: false, fans: false, ac: false };
    }

    if (schedule_status === 'inactive') {
        return { lights: false, fans: false, ac: false };
    }

    if (occupancy > 0 && occupancy < 5) {
        return {
            lights: !is_daytime,
            fans: true,
            ac: false
        };
    }

    return {
        lights: !is_daytime,
        fans: true,
        ac: false
    };
}

const getLiveAnalysis = (req, res) => {
    const { room_id } = req.params;

    const record = getLatestRecord(room_id);

    if (!record) {
        return res.status(404).json({
            status: 'error',
            message: `No data found for room ${room_id}`,
            errors: []
        });
    }

    const liveSchedule = getLiveScheduleStatus(room_id);
    const is_daytime = isLiveDaytime(liveSchedule.live_time);

    const occupancy = Math.max(0, Math.min(60, Number(record.occupancy)));

    const actual_device_state = {
        lights: record.devices.lights,
        fans: record.devices.fans,
        ac: record.devices.ac
    };

    const expected_device_state = getExpectedDeviceState({
        occupancy,
        is_daytime,
        schedule_status: liveSchedule.schedule_status
    });

    return res.status(200).json({
        status: 'success',
        data: {
            room_id,
            occupancy,
            max_occupancy: 60,
            occupancy_percentage: Math.round((occupancy / 60) * 100),
            is_empty: occupancy === 0,
            is_low_occupancy: occupancy > 0 && occupancy < 5,
            is_daytime,
            schedule_status: liveSchedule.schedule_status,
            matched_slot: liveSchedule.matched_slot,
            live_day: liveSchedule.live_day,
            live_time: liveSchedule.live_time,
            timezone: liveSchedule.timezone,
            actual_device_state,
            expected_device_state
        }
    });
};

module.exports = { getLiveAnalysis };