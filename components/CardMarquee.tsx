'use client'

const CARD_IMAGES = [
  '/static/Card/Card(1).png',
  '/static/Card/Card(2).png',
  '/static/Card/Card(3).png',
  '/static/Card/Card(4).png',
  '/static/Card/Card(5).png',
  '/static/Card/Card(6).png',
  '/static/Card/Card(7).png',
  '/static/Card/Card(8).png',
]

const LOOP_CARDS = [...CARD_IMAGES, ...CARD_IMAGES, ...CARD_IMAGES]

export function CardMarquee() {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0B0B18]/80 shadow-[0_30px_120px_-60px_rgba(0,229,196,0.55)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,rgba(0,229,196,0.10),transparent_28%),radial-gradient(circle_at_55%_45%,rgba(255,107,157,0.10),transparent_32%),radial-gradient(circle_at_90%_55%,rgba(255,215,0,0.08),transparent_26%)]" />

      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-[#0B0B18] to-transparent sm:w-36" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-[#0B0B18] to-transparent sm:w-36" />

      <div className="relative z-10 px-0 py-8 sm:py-10">
        <div className="card-marquee-track flex w-max items-center gap-5 sm:gap-7">
          {LOOP_CARDS.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="group relative h-[210px] w-[145px] shrink-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_-22px_rgba(0,0,0,0.8)] sm:h-[260px] sm:w-[180px] lg:h-[300px] lg:w-[208px]"
              style={{
                transform:
                  index % 4 === 0
                    ? 'rotate(-2deg)'
                    : index % 4 === 1
                      ? 'rotate(1.5deg)'
                      : index % 4 === 2
                        ? 'rotate(-1deg)'
                        : 'rotate(2deg)',
              }}
            >
              <div className="absolute inset-0 z-10 rounded-[1.5rem] ring-1 ring-inset ring-white/10" />

              <img
                src={src}
                alt={`Ritual Paws card ${index + 1}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .card-marquee-track {
          animation: cardMarquee 38s linear infinite;
          will-change: transform;
        }

        .card-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes cardMarquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  )
}
