# Profile Page Refactoring

This document describes the refactored profile page structure that improves maintainability, mobile responsiveness, and accessibility.

## Overview

The original profile page was a single large file (~800 lines) with multiple responsibilities. It has been split into:

- **Components**: Reusable UI components with mobile-first design
- **Hooks**: Custom hooks for state management and side effects
- **Utils**: Utility functions and constants
- **Types**: TypeScript interfaces and types

## File Structure

```
app/profile/
├── components/
│   ├── ProfileHeader.tsx          # Header with breadcrumbs and responsive title
│   ├── ProfileOverview.tsx        # Left column with profile picture and mobile-optimized upload
│   ├── ProfileDetails.tsx         # Right column container with responsive layout
│   ├── PersonalInformation.tsx    # Personal info form with ARIA support
│   ├── AccountStatus.tsx          # Account status display with mobile layout
│   ├── QuickActions.tsx           # Quick action buttons with icons
│   ├── MessageDisplay.tsx         # Message/notification display with ARIA live regions
│   ├── UploadProgress.tsx         # Progress indicators with ARIA progressbar
│   └── ImageCropModal.tsx         # Mobile-responsive image cropping modal
├── hooks/
│   ├── useProfileData.ts          # Profile data management
│   ├── useImageUpload.ts          # Image upload and processing
│   ├── useOnlineStatus.ts         # Online/offline detection
│   └── useMessage.ts              # Message state management
├── utils/
│   ├── constants.ts               # Configuration constants
│   └── imageUtils.ts              # Image processing utilities
├── index.ts                       # Main exports
└── page.tsx                       # Main page component with responsive grid
```

## Key Improvements

### 1. Mobile-First Design

- **Responsive Layout**: Sidebar collapses to full width on mobile, fixed width on desktop
- **Touch-Friendly UI**: Larger buttons and touch targets for mobile devices
- **Adaptive Components**: Components detect device type and adjust behavior accordingly
- **Mobile-Optimized Upload**: Different text and behavior for touch vs desktop

### 2. Enhanced Accessibility

- **ARIA Labels**: Comprehensive labeling for screen readers
- **Live Regions**: Status announcements for dynamic content
- **Keyboard Navigation**: Full keyboard accessibility
- **Progress Indicators**: ARIA progressbar support
- **Form Accessibility**: Proper form semantics and error announcements

### 3. Improved User Experience

- **Breadcrumb Navigation**: Clear navigation context
- **Enhanced Loading States**: More informative loading indicators
- **Better Error Handling**: User-friendly error messages
- **Offline Support**: Graceful degradation when offline
- **Responsive Typography**: Appropriate text sizes for all devices

### 4. Separation of Concerns

- **UI Components**: Pure presentation components with mobile responsiveness
- **Business Logic**: Custom hooks handle state and side effects
- **Utilities**: Reusable functions and constants

### 5. Reusability

- Components can be reused in other parts of the application
- Hooks can be shared across different features
- Utilities are available throughout the app

### 6. Testability

- Each component and hook can be tested in isolation
- Easier to mock dependencies for unit tests
- Clear interfaces make testing straightforward

### 7. Maintainability

- Smaller files are easier to understand and modify
- Changes to one feature don't affect others
- Clear component boundaries prevent bugs

### 8. Type Safety

- Strong TypeScript typing throughout
- Proper interfaces for all component props
- Type-safe utility functions

## Mobile Optimizations

### Layout Adaptations

- **Sidebar**: Full width on mobile (`w-full md:w-64`), fixed width on desktop
- **Grid System**: `grid-cols-1 xl:grid-cols-2` for better mobile stacking
- **Spacing**: Responsive spacing with `space-y-4 md:space-y-6`
- **Button Layouts**: Stacked on mobile, inline on desktop

### Touch Interactions

- **Upload Area**: "Tap to select" on mobile, "Click to upload" on desktop
- **Button Sizes**: Larger touch targets on mobile devices
- **Modal Sizing**: Responsive modal with `max-h-[90vh]` for mobile

### Content Hierarchy

- **Typography**: Responsive text sizes (`text-2xl md:text-3xl`)
- **Image Sizes**: Smaller profile images on mobile (`w-20 h-20 md:w-24 md:h-24`)
- **Form Layouts**: Stacked inputs on mobile, side-by-side on desktop

## Accessibility Features

### ARIA Support

- **Form Labels**: Proper `htmlFor` and `id` associations
- **Live Regions**: `aria-live="polite"` for status updates
- **Progress Bars**: `role="progressbar"` with value attributes
- **Modal Dialogs**: `role="dialog"` with `aria-modal="true"`

### Screen Reader Support

- **Hidden Labels**: `aria-describedby` for additional context
- **Status Announcements**: Automatic announcements for state changes
- **Error Messages**: Clear error descriptions and recovery instructions

### Keyboard Navigation

- **Focus Management**: Proper tab order and focus indicators
- **Shortcut Keys**: Keyboard shortcuts for common actions
- **Skip Links**: Quick navigation for screen reader users

## Usage Examples

### Using Components

```tsx
import { ProfileOverview, PersonalInformation } from './profile'

function MyProfilePage() {
  const profileData = useProfileData()
  const imageUpload = useImageUpload()

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      <ProfileOverview
        user={profileData.user}
        // ... other props
      />
      <PersonalInformation
        user={profileData.user}
        // ... other props
      />
    </div>
  )
}
```

### Using Hooks

```tsx
import { useImageUpload, useMessage } from './profile'

function ImageUploader() {
  const { showMessage } = useMessage()
  const {
    selectedFile,
    handleFileSelect,
    handleConfirmUpload
  } = useImageUpload()

  const onUpload = async () => {
    const result = await handleConfirmUpload(true)
    if (result) {
      showMessage(result.success ? 'success' : 'error', result.message)
    }
  }

  return (
    // ... component JSX
  )
}
```

### Using Utilities

```tsx
import { validateImageFile, IMAGE_CONFIG } from './profile/utils'

async function handleFile(file: File) {
  const validation = await validateImageFile(file)
  if (!validation.isValid) {
    console.error(validation.error)
    return
  }

  // File is valid, proceed with processing
}
```

## Migration Guide

If you need to modify the profile page:

1. **For UI changes**: Look at the appropriate component in `components/`
2. **For state logic**: Check the relevant hook in `hooks/`
3. **For utilities**: Look in `utils/`
4. **For new features**: Add new components/hooks following the established patterns

## Performance Benefits

- **Code Splitting**: Components are lazy-loaded as needed
- **Bundle Size**: Only load what's necessary
- **Caching**: Better cache invalidation for individual components
- **Tree Shaking**: Unused code is automatically removed

## Best Practices

1. **Keep components small**: Aim for single responsibility
2. **Use custom hooks**: Extract complex logic into reusable hooks
3. **Type everything**: Strong typing prevents runtime errors
4. **Test components**: Unit test components and hooks separately
5. **Document interfaces**: Clear prop interfaces with JSDoc comments
6. **Mobile-first**: Design for mobile, enhance for desktop
7. **Accessibility**: Include ARIA support from the start

## Future Enhancements

- Add error boundaries for better error handling
- Implement component-level loading states
- Add internationalization support
- Create a design system for consistent styling
- Add more accessibility improvements
- Implement progressive web app features
- Add offline-first capabilities

## Overview

The original profile page was a single large file (~800 lines) with multiple responsibilities. It has been split into:

- **Components**: Reusable UI components
- **Hooks**: Custom hooks for state management and side effects
- **Utils**: Utility functions and constants
- **Types**: TypeScript interfaces and types

## File Structure

```
app/profile/
├── components/
│   ├── ProfileHeader.tsx          # Header with title and navigation
│   ├── ProfileOverview.tsx        # Left column with profile picture and upload
│   ├── ProfileDetails.tsx         # Right column container
│   ├── PersonalInformation.tsx    # Personal info form
│   ├── AccountStatus.tsx          # Account status display
│   ├── QuickActions.tsx           # Quick action buttons
│   ├── MessageDisplay.tsx         # Message/notification display
│   ├── UploadProgress.tsx         # Progress indicators
│   └── ImageCropModal.tsx         # Image cropping modal
├── hooks/
│   ├── useProfileData.ts          # Profile data management
│   ├── useImageUpload.ts          # Image upload and processing
│   ├── useOnlineStatus.ts         # Online/offline detection
│   └── useMessage.ts              # Message state management
├── utils/
│   ├── constants.ts               # Configuration constants
│   └── imageUtils.ts              # Image processing utilities
├── index.ts                       # Main exports
└── page.tsx                       # Main page component
```

## Key Improvements

### 1. Separation of Concerns

- **UI Components**: Pure presentation components
- **Business Logic**: Custom hooks handle state and side effects
- **Utilities**: Reusable functions and constants

### 2. Reusability

- Components can be reused in other parts of the application
- Hooks can be shared across different features
- Utilities are available throughout the app

### 3. Testability

- Each component and hook can be tested in isolation
- Easier to mock dependencies for unit tests
- Clear interfaces make testing straightforward

### 4. Maintainability

- Smaller files are easier to understand and modify
- Changes to one feature don't affect others
- Clear component boundaries prevent bugs

### 5. Type Safety

- Strong TypeScript typing throughout
- Proper interfaces for all component props
- Type-safe utility functions

## Usage Examples

### Using Components

```tsx
import { ProfileOverview, PersonalInformation } from './profile'

function MyProfilePage() {
  const profileData = useProfileData()
  const imageUpload = useImageUpload()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileOverview
        user={profileData.user}
        // ... other props
      />
      <PersonalInformation
        user={profileData.user}
        // ... other props
      />
    </div>
  )
}
```

### Using Hooks

```tsx
import { useImageUpload, useMessage } from './profile'

function ImageUploader() {
  const { showMessage } = useMessage()
  const {
    selectedFile,
    handleFileSelect,
    handleConfirmUpload
  } = useImageUpload()

  const onUpload = async () => {
    const result = await handleConfirmUpload(true)
    if (result) {
      showMessage(result.success ? 'success' : 'error', result.message)
    }
  }

  return (
    // ... component JSX
  )
}
```

### Using Utilities

```tsx
import { validateImageFile, IMAGE_CONFIG } from './profile/utils'

async function handleFile(file: File) {
  const validation = await validateImageFile(file)
  if (!validation.isValid) {
    console.error(validation.error)
    return
  }

  // File is valid, proceed with processing
}
```

## Migration Guide

If you need to modify the profile page:

1. **For UI changes**: Look at the appropriate component in `components/`
2. **For state logic**: Check the relevant hook in `hooks/`
3. **For utilities**: Look in `utils/`
4. **For new features**: Add new components/hooks following the established patterns

## Performance Benefits

- **Code Splitting**: Components are lazy-loaded as needed
- **Bundle Size**: Only load what's necessary
- **Caching**: Better cache invalidation for individual components
- **Tree Shaking**: Unused code is automatically removed

## Best Practices

1. **Keep components small**: Aim for single responsibility
2. **Use custom hooks**: Extract complex logic into reusable hooks
3. **Type everything**: Strong typing prevents runtime errors
4. **Test components**: Unit test components and hooks separately
5. **Document interfaces**: Clear prop interfaces with JSDoc comments

## Future Enhancements

- Add error boundaries for better error handling
- Implement component-level loading states
- Add internationalization support
- Create a design system for consistent styling
- Add accessibility improvements
