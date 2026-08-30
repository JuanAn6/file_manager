export function formatDateFromDatabse(dateString) {
    //dateString = "2025-12-24T00:00:00.000000Z";
    if (!dateString) return '—';

    const date = new Date(dateString);
    // toISOString throws a RangeError on an unparseable date, which used to
    // blow up the whole row instead of rendering a placeholder.
    if (Number.isNaN(date.getTime())) return '—';

    return date.toISOString().slice(0, 16).replace('T', ' '); // "2025-12-24 00:00"
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatSize(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) return '0 B';

    const unit = Math.min(Math.floor(Math.log(value) / Math.log(1024)), SIZE_UNITS.length - 1);
    const scaled = value / 1024 ** unit;

    return `${scaled >= 10 || unit === 0 ? Math.round(scaled) : scaled.toFixed(1)} ${SIZE_UNITS[unit]}`;
}
