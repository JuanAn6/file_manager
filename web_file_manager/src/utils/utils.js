export function formatDateFromDatabse(dateString){
    //dateString = "2025-12-24T00:00:00.000000Z";
    const date = new Date(dateString);
    const result = date.toISOString().slice(0, 16).replace('T', ' ');
    return result; // result: "2025-12-24 00:00"
}