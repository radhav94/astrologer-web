# Chip Component

A reusable and scalable chip/tag component with multiple variants, sizes, and states.

## Usage

```jsx
import Chip from './components/UI/chip/Chip';

// Basic usage
<Chip label="English" onClick={handleClick} />

// Selected state
<Chip label="Hindi" selected onClick={handleClick} />

// With icon
<Chip label="Add Language" icon={<PlusIcon />} onClick={handleClick} />

// Different variants
<Chip label="Primary" variant="primary" onClick={handleClick} />
<Chip label="Secondary" variant="secondary" onClick={handleClick} />
<Chip label="Outline" variant="outline" onClick={handleClick} />

// Different sizes
<Chip label="Small" size="small" onClick={handleClick} />
<Chip label="Medium" size="medium" onClick={handleClick} />
<Chip label="Large" size="large" onClick={handleClick} />

// Icon position
<Chip label="Left Icon" icon={<Icon />} iconPosition="left" onClick={handleClick} />
<Chip label="Right Icon" icon={<Icon />} iconPosition="right" onClick={handleClick} />

// Disabled state
<Chip label="Disabled" disabled onClick={handleClick} />

// Custom className
<Chip label="Custom" className="my-custom-class" onClick={handleClick} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | The text content of the chip |
| `selected` | `boolean` | `false` | Whether the chip is in selected state |
| `onClick` | `function` | - | Click handler function |
| `icon` | `ReactNode` | - | Icon element to display |
| `iconPosition` | `"left" \| "right"` | `"left"` | Position of the icon |
| `variant` | `"default" \| "primary" \| "secondary" \| "outline"` | `"default"` | Visual variant of the chip |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | Size of the chip |
| `disabled` | `boolean` | `false` | Whether the chip is disabled |
| `className` | `string` | `""` | Additional CSS classes |
| `...props` | - | - | Any other button props |

## Variants

### Default
- Light gray background
- Dark gray text
- Darker background on hover
- Black background when selected

### Primary
- Gradient background (orange to red)
- White text
- Slightly transparent on hover
- Enhanced shadow when selected

### Secondary
- Cream/beige background
- Dark text
- Border outline
- Gradient background when selected

### Outline
- Transparent background
- Border outline
- Dark text
- Filled background when selected

## Sizes

- **Small**: 6px 12px padding, 12px font
- **Medium**: 8px 16px padding, 14px font (default)
- **Large**: 10px 20px padding, 16px font

## Examples

### Language Selection
```jsx
const languages = ["English", "Hindi", "Marathi"];
const [selected, setSelected] = useState([]);

{languages.map(lang => (
  <Chip
    key={lang}
    label={lang}
    selected={selected.includes(lang)}
    onClick={() => toggleLanguage(lang)}
  />
))}
```

### Filter Tags
```jsx
<Chip label="All" variant="primary" selected />
<Chip label="Active" variant="outline" />
<Chip label="Pending" variant="outline" />
```

### With Icons
```jsx
<Chip 
  label="Add New" 
  icon={<PlusIcon />} 
  variant="primary"
  onClick={handleAdd}
/>
```
