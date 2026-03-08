type Photo = {
  id: string
  image_url: string
  caption: string | null
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  return (
    <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'>
      <h3 className='text-base font-semibold text-white'>Photo gallery</h3>

      {!photos.length ? (
        <p className='mt-3 text-sm text-zinc-400'>No photos yet.</p>
      ) : (
        <div className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {photos.map((photo) => (
            <figure
              key={photo.id}
              className='overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900'
            >
              <img
                src={photo.image_url}
                alt={photo.caption || 'Place photo'}
                className='h-48 w-full object-cover'
              />
              {photo.caption ? (
                <figcaption className='px-4 py-3 text-sm text-zinc-300'>
                  {photo.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
