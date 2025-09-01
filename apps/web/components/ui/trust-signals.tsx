import { ShieldCheckIcon, UsersIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface TrustSignalProps {
  type: 'security' | 'users' | 'rating' | 'guarantee'
  value?: string | number
  className?: string
}

export function TrustSignal({ type, value, className = "" }: TrustSignalProps) {
  const signals = {
    security: {
      icon: ShieldCheckIcon,
      text: 'SSL Secured',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    users: {
      icon: UsersIcon,
      text: value ? `${value}+ users` : '10,000+ users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    rating: {
      icon: StarIcon,
      text: value ? `${value}/5 rating` : '4.9/5 rating',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    guarantee: {
      icon: CheckCircleIcon,
      text: value || '30-day money back guarantee',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  }

  const signal = signals[type]
  const Icon = signal.icon

  return (
    <div className={`flex items-center text-sm text-gray-600 ${className}`}>
      <div className={`p-2 rounded-full ${signal.bgColor} mr-3`}>
        <Icon className={`w-4 h-4 ${signal.color}`} aria-hidden="true" />
      </div>
      <span className="font-medium">{signal.text}</span>
    </div>
  )
}

interface TrustSignalsProps {
  signals?: Array<{
    type: TrustSignalProps['type']
    value?: string | number
  }>
  layout?: 'horizontal' | 'vertical'
  className?: string
}

export function TrustSignals({
  signals = [
    { type: 'security' },
    { type: 'users', value: '10,000' },
    { type: 'rating', value: '4.9' },
    { type: 'guarantee' }
  ],
  layout = 'horizontal',
  className = ""
}: TrustSignalsProps) {
  const layoutClasses = layout === 'horizontal'
    ? 'flex flex-wrap items-center justify-center gap-6'
    : 'space-y-4'

  return (
    <div className={`${layoutClasses} ${className}`} role="region" aria-labelledby="trust-signals">
      <h2 id="trust-signals" className="sr-only">Trust and Security Indicators</h2>
      {signals.map((signal, index) => (
        <TrustSignal
          key={index}
          type={signal.type}
          value={signal.value}
        />
      ))}
    </div>
  )
}
