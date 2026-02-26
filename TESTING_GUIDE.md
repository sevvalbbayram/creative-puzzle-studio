# Testing & Deployment Guide

## Quick Start

### Development Environment

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Output will be in the `dist/` directory
```

## Testing Checklist

### Mobile Testing (< 768px)

#### Layout & Responsiveness
- [ ] Puzzle board scales correctly and maintains aspect ratio
- [ ] Pieces tray collapses/expands with toggle button
- [ ] Header fits on screen without overflow
- [ ] Progress bar is visible and readable
- [ ] All buttons are at least 44x44px (touch target size)
- [ ] Text is readable without zooming

#### Interactions
- [ ] Tap on a piece selects it (visual feedback)
- [ ] Tap on a slot places the selected piece
- [ ] Correct placement shows sparkle and confetti
- [ ] Incorrect placement shows shake animation
- [ ] Pieces tray scrolls smoothly
- [ ] No horizontal scrolling needed on main content

#### Phase Transitions
- [ ] Phase 1 completes when all stages are placed
- [ ] Transition animation plays smoothly
- [ ] Phase 2 loads with quote pieces
- [ ] All pieces are shuffled in phase 2

#### Performance
- [ ] App loads in < 3 seconds
- [ ] Interactions respond within 100ms
- [ ] Animations run at 60 FPS
- [ ] No lag when placing pieces
- [ ] Memory usage stays reasonable

### Tablet Testing (768px - 1024px)

#### Layout & Responsiveness
- [ ] Two-column layout displays correctly
- [ ] Puzzle board takes up left 60-70% of space
- [ ] Pieces tray takes up right 30-40% of space
- [ ] All elements are properly aligned
- [ ] No unnecessary scrolling

#### Interactions
- [ ] Drag-and-drop works smoothly
- [ ] Tap-to-select still works as fallback
- [ ] Touch gestures are responsive
- [ ] No accidental selections

### Desktop Testing (> 1024px)

#### Layout & Responsiveness
- [ ] Full-width layout displays correctly
- [ ] Puzzle board and tray are well-proportioned
- [ ] Sidebar doesn't obstruct content
- [ ] All UI elements are accessible

#### Interactions
- [ ] Drag-and-drop works smoothly with mouse
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Hover effects display correctly
- [ ] Double-click doesn't cause issues

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Feature Testing

#### Game Flow
- [ ] Home page loads correctly
- [ ] Can create a new game session
- [ ] Can join a game with code
- [ ] Lobby displays correctly
- [ ] Game starts when teacher initiates
- [ ] Game page loads with puzzle
- [ ] Results page displays score
- [ ] Leaderboard shows rankings

#### Puzzle Mechanics
- [ ] Stage names are shuffled
- [ ] Quotes are randomized
- [ ] Correct placements are detected
- [ ] Incorrect placements are rejected
- [ ] Combo streak increments correctly
- [ ] Score calculation is accurate

#### Visual Feedback
- [ ] Sparkle effects appear on correct placement
- [ ] Confetti bursts at appropriate times
- [ ] Shake animation on incorrect placement
- [ ] Combo counter displays correctly
- [ ] Progress bar updates in real-time
- [ ] Phase transition animation is smooth

#### Audio (if enabled)
- [ ] Correct sound plays on successful placement
- [ ] Error sound plays on failed placement
- [ ] Celebration sound plays on completion
- [ ] Volume can be controlled
- [ ] Mute button works

#### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces elements correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] ARIA labels are present

### Cross-Device Testing

#### Devices Tested
- [ ] iPhone 12 / 13 / 14 / 15
- [ ] iPad (7th gen and newer)
- [ ] Samsung Galaxy S21 / S22
- [ ] Google Pixel 6 / 7
- [ ] Desktop (1920x1080)
- [ ] Desktop (2560x1440)
- [ ] Desktop (1366x768)

#### Orientations
- [ ] Portrait mode on mobile
- [ ] Landscape mode on mobile
- [ ] Tablet portrait
- [ ] Tablet landscape

### Network Testing

#### Slow Network (3G)
- [ ] App loads within reasonable time
- [ ] Images load progressively
- [ ] No timeout errors
- [ ] Graceful degradation

#### Offline Mode
- [ ] App doesn't crash if connection drops
- [ ] Appropriate error messages display
- [ ] Can retry connection

### Performance Testing

#### Lighthouse Scores
- [ ] Performance: > 80
- [ ] Accessibility: > 90
- [ ] Best Practices: > 85
- [ ] SEO: > 90

#### Bundle Size
- [ ] JavaScript: < 300KB (gzipped)
- [ ] CSS: < 50KB (gzipped)
- [ ] Images: < 3MB total
- [ ] Total: < 5MB

#### Load Time
- [ ] First Contentful Paint: < 2s
- [ ] Largest Contentful Paint: < 3s
- [ ] Cumulative Layout Shift: < 0.1
- [ ] Time to Interactive: < 4s

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Code is properly formatted
- [ ] Comments are clear and helpful
- [ ] Dependencies are up to date
- [ ] Environment variables are set
- [ ] Build succeeds without warnings

### Build Verification
- [ ] Production build completes successfully
- [ ] Bundle size is acceptable
- [ ] No source maps in production
- [ ] Assets are properly optimized
- [ ] Cache busting is working

### Deployment Steps

#### To Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

#### To GitHub Pages
```bash
# Build the project
npm run build

# Deploy dist folder to gh-pages branch
# Update package.json with correct homepage URL
```

#### To Docker
```bash
# Build Docker image
docker build -t creative-puzzle-studio .

# Run container
docker run -p 3000:80 creative-puzzle-studio
```

### Post-Deployment
- [ ] App loads correctly in production
- [ ] All features work as expected
- [ ] Performance metrics are acceptable
- [ ] Error tracking is working
- [ ] Analytics are tracking correctly
- [ ] Backup is created

## Monitoring

### Error Tracking
- Set up Sentry or similar service
- Monitor for JavaScript errors
- Track user-reported issues
- Set up alerts for critical errors

### Performance Monitoring
- Monitor page load times
- Track Core Web Vitals
- Monitor API response times
- Track user interactions

### User Analytics
- Track game completion rates
- Monitor average play time
- Track difficulty preferences
- Monitor user retention

## Rollback Plan

If issues occur in production:

1. **Immediate**: Revert to previous stable version
2. **Investigation**: Analyze error logs and metrics
3. **Fix**: Create and test fix in development
4. **Redeploy**: Deploy fixed version with monitoring
5. **Verification**: Confirm fix resolves issue

## Common Issues & Solutions

### Issue: Pieces not appearing
**Solution**: Check browser console for errors, verify image paths, clear cache

### Issue: Drag-and-drop not working
**Solution**: Ensure Framer Motion is loaded, check for JavaScript errors

### Issue: Performance degradation
**Solution**: Check bundle size, optimize images, reduce animation complexity

### Issue: Mobile layout broken
**Solution**: Verify viewport meta tag, test on actual device, check media queries

## Support & Documentation

- **Development Docs**: See JIGSAW_PUZZLE_ENHANCEMENT.md
- **API Docs**: See README.md
- **Troubleshooting**: See JIGSAW_PUZZLE_ENHANCEMENT.md#troubleshooting

---

**Last Updated**: February 2026
**Version**: 2.0.0
