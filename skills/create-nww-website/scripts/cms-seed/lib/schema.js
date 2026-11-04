/**
 * Generates a clean URL slug from text
 */
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates and normalizes seed post JSON into the exact NWW Mongoose Blog schema
 */
function validateAndFormatSeedPayload(raw, options = {}) {
  const errors = [];

  if (!raw.title || typeof raw.title !== 'string' || raw.title.trim().length < 2) {
    errors.push('Field "title" is required and must be at least 2 characters.');
  }

  if (!raw.content || typeof raw.content !== 'string' || raw.content.trim().length === 0) {
    errors.push('Field "content" is required and must contain HTML rich-text.');
  }

  // Normalized slug
  const slug = (raw.slug || '').trim().toLowerCase() || slugify(raw.title);

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`Slug "${slug}" is invalid. Must be lowercase hyphenated alphanumeric (kebab-case).`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  // Excerpt fallback
  const fallbackExcerpt = raw.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 155) + '...';

  // Strict Mongoose placement: category and tags MUST reside in metadata Map
  const metadata = Object.assign({}, raw.metadata || {});
  if (raw.category && !metadata.category) {
    metadata.category = raw.category;
  }
  if (raw.tags && !metadata.tags) {
    metadata.tags = Array.isArray(raw.tags) ? raw.tags : [raw.tags];
  }

  const status = options.status || raw.status || 'published';
  const postedAt = raw.postedAt || new Date().toISOString();

  // Author sugar object handling
  let authorObj = undefined;
  if (raw.author && typeof raw.author === 'object') {
    authorObj = raw.author;
  } else if (raw.author_name || raw.author_image) {
    authorObj = {
      mode: 'manual',
      name: raw.author_name || 'Editorial Team',
      image: raw.author_image || null
    };
  }

  const payload = {
    title: raw.title.trim(),
    slug: slug,
    content: raw.content.trim(),
    status: status,
    cover_image: raw.cover_image || null,
    image: raw.image || raw.cover_image || null,
    order: typeof raw.order === 'number' ? raw.order : 0,
    metaTitle: (raw.metaTitle || raw.title).trim(),
    metaDescription: (raw.metaDescription || raw.excerpt || fallbackExcerpt).trim(),
    author_name: raw.author_name || (authorObj && authorObj.name) || 'Editorial Team',
    author_image: raw.author_image || (authorObj && authorObj.image) || null,
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    postedAt: postedAt,
    editTimeFields: true,
    metadata: metadata
  };

  if (raw.author_id) {
    payload.author_id = raw.author_id;
  }
  if (authorObj) {
    payload.author = authorObj;
  }

  return payload;
}

module.exports = { slugify, validateAndFormatSeedPayload };

