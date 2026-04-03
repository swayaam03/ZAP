import Badge from '../ui/Badge'

const variantMap = {
  urgent: 'danger',
  high:   'warning',
  medium: 'brand',
  low:    'default',
}

export default function PriorityBadge({ priority }) {
  return (
    <Badge variant={variantMap[priority] || 'default'}>
      {priority}
    </Badge>
  )
}
