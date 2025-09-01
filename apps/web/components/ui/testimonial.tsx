import { StarIcon } from '@heroicons/react/24/solid'

interface TestimonialProps {
  quote: string
  author: string
  role: string
  company?: string
  rating?: number
  className?: string
}

export function Testimonial({
  quote,
  author,
  role,
  company,
  rating = 5,
  className = ""
}: TestimonialProps) {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200/50 ${className}`} role="region" aria-labelledby={`testimonial-${author.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="flex items-center mb-4" aria-label={`Rating: ${rating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            aria-hidden="true"
          />
        ))}
      </div>

      <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-4">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <cite className="text-sm text-gray-600 font-medium not-italic">
        — {author}, {role}
        {company && <span className="text-gray-500"> at {company}</span>}
      </cite>
    </div>
  )
}

interface TestimonialGridProps {
  testimonials: Array<{
    quote: string
    author: string
    role: string
    company?: string
    rating?: number
  }>
  className?: string
}

export function TestimonialGrid({ testimonials, className = "" }: TestimonialGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`} role="region" aria-labelledby="testimonials-section">
      <h2 id="testimonials-section" className="sr-only">Customer Testimonials</h2>
      {testimonials.map((testimonial, index) => (
        <Testimonial
          key={index}
          {...testimonial}
        />
      ))}
    </div>
  )
}
