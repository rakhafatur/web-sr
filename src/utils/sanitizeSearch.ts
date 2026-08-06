/**
 * Escape karakter yang punya arti khusus di sintaks filter PostgREST
 * (koma = pemisah OR, kurung = grouping) dan wildcard LIKE (%, _) sebelum
 * diselipkan ke `.or()`/`.ilike()` dengan input dari user (search box).
 *
 * Tanpa ini, user bisa mengetik koma di kotak pencarian biasa untuk
 * menyisipkan kondisi filter tambahan yang tidak dimaksud — mis. mencari
 * "x,id.neq.0" bisa kepecah PostgREST jadi 2 filter terpisah alih-alih
 * 1 pencarian teks literal.
 */
export const sanitizeSearchKeyword = (keyword: string) =>
  keyword.replace(/[,()%_]/g, '');
