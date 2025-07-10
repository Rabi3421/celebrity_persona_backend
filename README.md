# Celebrity Persona Backend

A production-ready Node.js backend API for a celebrity outfit affiliate website. This application manages celebrities, their outfits, blogs, admin authentication, and provides comprehensive tracking and analytics for user interactions.

## 🚀 Features

- **Celebrity Management**: Complete CRUD operations for celebrities with search and filtering
- **Outfit Tracking**: Manage celebrity outfits with affiliate links and trending analytics
- **Blog System**: Full-featured blog management with categories, tags, and featured posts
- **Tag Management**: Comprehensive tag system for organizing and categorizing content
- **Trending System**: Smart trending detection and management across all content types
- **Inquiry Management**: Professional inquiry handling system with file attachments and admin workflow
- **Newsletter Management**: Complete email subscription system with engagement tracking and segmentation
- **Admin Authentication**: JWT-based authentication with role-based access control
- **Content Moderation**: Admin tools for approving, featuring, and managing content
- **User Management**: Admin user creation and management with permissions
- **Analytics & Tracking**: Comprehensive tracking system for clicks, page views, and user behavior
- **Advanced Analytics**: Detailed analytics with traffic, content performance, and conversion tracking
- **Dashboard Analytics**: Real-time admin dashboard with system statistics
- **Production Ready**: Security middleware, rate limiting, caching, and error handling
- **API Documentation**: RESTful API with standardized responses

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Caching**: Redis
- **File Upload**: Multer
- **Security**: Helmet, Rate Limiting, XSS Protection
- **Logging**: Winston
- **Validation**: Express Validator

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Redis (optional, for caching)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/celebrity-persona-backend.git
cd celebrity-persona-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/celebrity_persona
JWT_SECRET=your_super_secret_jwt_key_make_it_very_long_and_secure
REDIS_URL=redis://localhost:6379
```

4. **Create required directories**
```bash
mkdir uploads
mkdir uploads/inquiries
mkdir logs
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most admin endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response Format
All API responses follow this standardized format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "2025-07-08T17:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": null,
  "timestamp": "2025-07-08T17:00:00.000Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "timestamp": "2025-07-08T17:00:00.000Z"
}
```

### 👥 Celebrity Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/celebrities` | Get all celebrities | No |
| GET | `/celebrities?page=1&limit=10` | Get celebrities with pagination | No |
| GET | `/celebrities/trending` | Get trending celebrities | No |
| GET | `/celebrities/search?name=taylor` | Search celebrities | No |
| GET | `/celebrities/:slug` | Get celebrity by slug or ID | No |
| GET | `/celebrities/:slug/outfits` | Get celebrity's outfits | No |
| POST | `/celebrities` | Create new celebrity | Yes |
| PUT | `/celebrities/:id` | Update celebrity | Yes |
| DELETE | `/celebrities/:id` | Delete celebrity | Yes |

### 👗 Outfit Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/outfits` | Get all outfits | No |
| GET | `/outfits?page=1&limit=10` | Get outfits with pagination | No |
| GET | `/outfits/trending` | Get trending outfits | No |
| GET | `/outfits/search?name=dress` | Search outfits | No |
| GET | `/outfits/:id` | Get outfit by ID or slug | No |
| GET | `/outfits/celebrity/:celebrityId` | Get outfits by celebrity | No |
| POST | `/outfits` | Create new outfit | Yes |
| POST | `/outfits/filter` | Filter outfits | No |
| PUT | `/outfits/:id` | Update outfit | Yes |
| DELETE | `/outfits/:id` | Delete outfit | Yes |

### 📝 Blog Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/blogs` | Get all published blogs | No |
| GET | `/blogs?page=1&limit=10` | Get blogs with pagination | No |
| GET | `/blogs/featured` | Get featured blogs | No |
| GET | `/blogs/popular` | Get popular blogs (by views/likes) | No |
| GET | `/blogs/recent` | Get recent blogs | No |
| GET | `/blogs/search?title=fashion` | Search blogs | No |
| GET | `/blogs/category/:category` | Get blogs by category | No |
| GET | `/blogs/:slug` | Get blog by slug or ID | No |
| POST | `/blogs/:id/like` | Like/Unlike a blog | No |
| POST | `/blogs` | Create new blog | Yes |
| PUT | `/blogs/:id` | Update blog | Yes |
| DELETE | `/blogs/:id` | Delete blog | Yes |

### 🔐 Admin Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/admin/login` | Admin login | No | - |
| GET | `/admin/profile` | Get admin profile | Yes | Any |
| PUT | `/admin/profile` | Update admin profile | Yes | Any |
| PUT | `/admin/change-password` | Change password | Yes | Any |
| GET | `/admin/dashboard` | Get dashboard statistics | Yes | Any |
| POST | `/admin/moderate` | Moderate content | Yes | Moderator+ |
| POST | `/admin/bulk-operations` | Bulk operations | Yes | Moderator+ |
| GET | `/admin/logs` | Get system logs | Yes | Super Admin |
| GET | `/admin/users` | Get all admins | Yes | Super Admin |
| POST | `/admin/users` | Create new admin | Yes | Super Admin |
| PUT | `/admin/users/:id/status` | Update admin status | Yes | Super Admin |
| DELETE | `/admin/users/:id` | Delete admin | Yes | Super Admin |

### 📊 Tracking & Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/track/click` | Track click events | No |
| POST | `/track/page-view` | Track page views | No |
| POST | `/track/event` | Track custom events | No |
| GET | `/track/popular` | Get popular content | No |
| GET | `/track/analytics` | Get tracking analytics | Yes |
| GET | `/track/user/:userId` | Get user tracking data | Yes |
| GET | `/track/session/:sessionId` | Get session tracking data | Yes |
| POST | `/track/cleanup` | Cleanup old tracking data | Yes (Super Admin) |

### 📈 Advanced Analytics Endpoints

| Method | Endpoint | Description | Auth Required | Cache |
|--------|----------|-------------|---------------|-------|
| GET | `/analytics/overview` | Get overview analytics | Yes | 5 min |
| GET | `/analytics/traffic` | Get traffic analytics | Yes | 3 min |
| GET | `/analytics/content-performance` | Get content performance | Yes | 5 min |
| GET | `/analytics/user-behavior` | Get user behavior analytics | Yes | 10 min |
| GET | `/analytics/conversions` | Get conversion analytics | Yes | 5 min |
| GET | `/analytics/real-time` | Get real-time analytics | Yes | No cache |
| GET | `/analytics/export` | Export analytics data (CSV) | Yes (Admin+) | No cache |

### 🏷️ Tags Endpoints

| Method | Endpoint | Description | Auth Required | Cache |
|--------|----------|-------------|---------------|-------|
| GET | `/tags` | Get all tags | No | 10 min |
| GET | `/tags/popular` | Get popular tags | No | 10 min |
| GET | `/tags/trending` | Get trending tags | No | 5 min |
| GET | `/tags/search` | Search tags | No | 5 min |
| GET | `/tags/:id` | Get tag by ID or slug | No | 10 min |
| GET | `/tags/:tagId/content` | Get content by tag | No | 5 min |
| POST | `/tags` | Create new tag | Yes (Admin+) | - |
| PUT | `/tags/:id` | Update tag | Yes (Admin+) | - |
| DELETE | `/tags/:id` | Delete tag | Yes (Admin+) | - |
| POST | `/tags/merge` | Merge tags | Yes (Super Admin) | - |
| POST | `/tags/update-usage-counts` | Update tag usage counts | Yes (Super Admin) | - |

### 🔥 Trending Endpoints

| Method | Endpoint | Description | Auth Required | Cache |
|--------|----------|-------------|---------------|-------|
| GET | `/trending` | Get all trending content | No | 5 min |
| GET | `/trending/celebrities` | Get trending celebrities | No | 5 min |
| GET | `/trending/outfits` | Get trending outfits | No | 5 min |
| GET | `/trending/blogs` | Get trending blogs | No | 5 min |
| GET | `/trending/category/:category` | Get trending by category | No | 5 min |
| GET | `/trending/stats` | Get trending statistics | No | 10 min |
| POST | `/trending/set-status` | Set manual trending status | Yes (Admin+) | - |

### 📧 Inquiry Endpoints

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| POST | `/inquiry/submit` | Submit new inquiry with attachments | No | 3/15min |
| GET | `/inquiry/status` | Check inquiry status (public) | No | No |
| GET | `/inquiry` | Get all inquiries | Yes (Admin+) | No |
| GET | `/inquiry/stats` | Get inquiry statistics | Yes (Admin+) | No |
| GET | `/inquiry/export` | Export inquiries to CSV | Yes (Admin+) | No |
| POST | `/inquiry/bulk` | Bulk operations on inquiries | Yes (Admin+) | No |
| GET | `/inquiry/:id` | Get single inquiry details | Yes (Admin+) | No |
| PUT | `/inquiry/:id` | Update inquiry status/assignment | Yes (Admin+) | No |
| POST | `/inquiry/:id/response` | Add response to inquiry | Yes (Admin+) | No |
| POST | `/inquiry/:id/note` | Add internal note | Yes (Admin+) | No |
| DELETE | `/inquiry/:id` | Delete inquiry | Yes (Admin+) | No |

### 📬 Newsletter Endpoints

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| POST | `/newsletter/subscribe` | Subscribe to newsletter | No | 5/15min |
| GET | `/newsletter/confirm/:token` | Confirm email subscription | No | No |
| POST | `/newsletter/unsubscribe/:token` | Unsubscribe from newsletter | No | No |
| PUT | `/newsletter/preferences/:token` | Update subscription preferences | No | No |
| POST | `/newsletter/track` | Track email engagement (webhook) | No | No |
| GET | `/newsletter` | Get all subscribers | Yes (Admin+) | No |
| GET | `/newsletter/stats` | Get newsletter statistics | Yes (Admin+) | No |
| GET | `/newsletter/export` | Export subscribers to CSV | Yes (Admin+) | No |
| POST | `/newsletter/bulk` | Bulk operations on subscribers | Yes (Admin+) | No |
| GET | `/newsletter/:id` | Get single subscriber details | Yes (Admin+) | No |
| PUT | `/newsletter/:id` | Update subscriber | Yes (Admin+) | No |
| POST | `/newsletter/:id/note` | Add note to subscriber | Yes (Admin+) | No |
| DELETE | `/newsletter/:id` | Delete subscriber | Yes (Admin+) | No |

### 📊 Other Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |

## 🔐 Security Features

- **Helmet**: Security headers and CSP
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific origins
- **XSS Protection**: Input sanitization
- **NoSQL Injection Prevention**: MongoDB sanitization
- **Parameter Pollution Prevention**: HPP middleware
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control**: Admin, Moderator, Super Admin roles
- **File Upload Security**: Validation, size limits, and secure storage

## 👥 User Roles & Permissions

### Admin Roles
- **admin**: Basic administrative access
- **moderator**: Content moderation capabilities
- **super_admin**: Full system access including user management

### Permissions
- **read**: View content and data
- **write**: Create and edit content
- **delete**: Remove content
- **moderate**: Approve/reject content
- **user_management**: Manage admin users

## 📝 Request Examples

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

### Track Click Event
```bash
curl -X POST http://localhost:5000/api/track/click \
  -H "Content-Type: application/json" \
  -d '{
    "type": "outfit",
    "targetId": "64a1b2c3d4e5f6789012345",
    "url": "https://example.com/affiliate-link",
    "userId": "user123",
    "sessionId": "session456"
  }'
```

### Get All Tags
```bash
curl "http://localhost:5000/api/tags?page=1&limit=20&type=style"
```

### Get Popular Tags
```bash
curl "http://localhost:5000/api/tags/popular?limit=10"
```

### Get Trending Tags
```bash
curl "http://localhost:5000/api/tags/trending?days=7&limit=15"
```

### Search Tags
```bash
curl "http://localhost:5000/api/tags/search?q=fashion&limit=10"
```

### Get Content by Tag
```bash
curl "http://localhost:5000/api/tags/TAG_ID/content?type=outfit&page=1&limit=10"
```

### Create New Tag (Admin)
```bash
curl -X POST http://localhost:5000/api/tags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Fashion",
    "description": "Trendy summer outfits and styles",
    "type": "season",
    "color": "#ff6b6b"
  }'
```

### Update Tag (Admin)
```bash
curl -X PUT http://localhost:5000/api/tags/TAG_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Style",
    "description": "Updated description for summer fashion"
  }'
```

### Merge Tags (Super Admin)
```bash
curl -X POST http://localhost:5000/api/tags/merge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceTagId": "64a1b2c3d4e5f6789012345",
    "targetTagId": "64a1b2c3d4e5f6789012346"
  }'
```

### Update Tag Usage Counts (Super Admin)
```bash
curl -X POST http://localhost:5000/api/tags/update-usage-counts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Tag (Admin)
```bash
curl -X DELETE http://localhost:5000/api/tags/TAG_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Trending Content
```bash
curl "http://localhost:5000/api/trending?period=7&limit=5"
```

### Get Trending Celebrities
```bash
curl "http://localhost:5000/api/trending/celebrities?limit=10&period=14"
```

### Get Trending Outfits
```bash
curl "http://localhost:5000/api/trending/outfits?limit=15&category=dress"
```

### Get Trending Blogs
```bash
curl "http://localhost:5000/api/trending/blogs?limit=8&period=30"
```

### Get Trending by Category
```bash
curl "http://localhost:5000/api/trending/category/fashion?limit=10&period=7"
```

### Get Trending Statistics
```bash
curl "http://localhost:5000/api/trending/stats?period=30"
```

### Set Trending Status (Admin)
```bash
curl -X POST http://localhost:5000/api/trending/set-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "celebrity",
    "id": "64a1b2c3d4e5f6789012345",
    "trending": true
  }'
```

### Submit Inquiry
```bash
curl -X POST http://localhost:5000/api/inquiry/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Partnership Inquiry",
    "message": "I would like to discuss a potential partnership opportunity.",
    "type": "business",
    "source": "website"
  }'
```

### Submit Inquiry with File Attachments
```bash
curl -X POST http://localhost:5000/api/inquiry/submit \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "subject=Business Proposal" \
  -F "message=Please find attached our business proposal." \
  -F "type=business" \
  -F "attachments=@proposal.pdf" \
  -F "attachments=@company-profile.pdf"
```

### Check Inquiry Status (Public)
```bash
curl "http://localhost:5000/api/inquiry/status?email=john@example.com&inquiryId=INQUIRY_ID"
```

### Get All Inquiries (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/inquiry?page=1&limit=20&status=pending&type=business"
```

### Get Single Inquiry (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/inquiry/INQUIRY_ID"
```

### Update Inquiry Status (Admin)
```bash
curl -X PUT http://localhost:5000/api/inquiry/INQUIRY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "high",
    "assignedTo": "ADMIN_ID",
    "tags": ["urgent", "partnership"]
  }'
```

### Add Response to Inquiry (Admin)
```bash
curl -X POST http://localhost:5000/api/inquiry/INQUIRY_ID/response \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Thank you for your inquiry. We will review your proposal and get back to you within 48 hours.",
    "isPublic": true
  }'
```

### Add Internal Note (Admin)
```bash
curl -X POST http://localhost:5000/api/inquiry/INQUIRY_ID/note \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "This looks like a promising partnership opportunity. Need to discuss with the team."
  }'
```

### Get Inquiry Statistics (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/inquiry/stats?period=30"
```

### Bulk Operations on Inquiries (Admin)
```bash
curl -X POST http://localhost:5000/api/inquiry/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_status",
    "inquiryIds": ["ID1", "ID2", "ID3"],
    "updateData": {"status": "resolved"}
  }'
```

### Export Inquiries (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/inquiry/export?format=csv&startDate=2025-01-01&status=resolved" \
  --output inquiries.csv
```

### Subscribe to Newsletter
```bash
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "interests": ["fashion", "celebrities"],
    "preferences": {
      "frequency": "weekly",
      "contentTypes": ["celebrity_updates", "outfit_trends"]
    },
    "source": "website"
  }'
```

### Confirm Newsletter Subscription
```bash
curl "http://localhost:5000/api/newsletter/confirm/CONFIRMATION_TOKEN"
```

### Update Newsletter Preferences
```bash
curl -X PUT http://localhost:5000/api/newsletter/preferences/UNSUBSCRIBE_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "frequency": "bi-weekly",
      "contentTypes": ["celebrity_updates", "fashion_tips"]
    },
    "interests": ["fashion", "beauty", "lifestyle"]
  }'
```

### Unsubscribe from Newsletter
```bash
curl -X POST http://localhost:5000/api/newsletter/unsubscribe/UNSUBSCRIBE_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "too_frequent"
  }'
```

### Get All Newsletter Subscribers (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/newsletter?page=1&limit=20&status=active&confirmed=true"
```

### Get Single Newsletter Subscriber (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/newsletter/SUBSCRIBER_ID"
```

### Update Newsletter Subscriber (Admin)
```bash
curl -X PUT http://localhost:5000/api/newsletter/SUBSCRIBER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "tags": ["vip", "engaged"],
    "interests": ["fashion", "celebrities", "trends"]
  }'
```

### Get Newsletter Statistics (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/newsletter/stats?period=30"
```

### Track Newsletter Email Engagement (Webhook)
```bash
curl -X POST http://localhost:5000/api/newsletter/track \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "type": "open",
    "timestamp": "2025-07-10T12:00:00Z"
  }'
```

### Export Newsletter Subscribers (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/newsletter/export?format=csv&status=active" \
  --output newsletter-subscribers.csv
```

### Newsletter Bulk Operations (Admin)
```bash
curl -X POST http://localhost:5000/api/newsletter/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add_tags",
    "subscriberIds": ["ID1", "ID2", "ID3"],
    "updateData": {"tags": ["promotional", "campaign_2025"]}
  }'
```

### Get Overview Analytics (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/analytics/overview?startDate=2025-01-01&endDate=2025-01-31"
```

### Get Traffic Analytics (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/analytics/traffic?startDate=2025-01-01&endDate=2025-01-31&groupBy=day"
```

### Get Content Performance (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/analytics/content-performance?type=outfit&limit=10"
```

### Get User Behavior Analytics (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/analytics/user-behavior?startDate=2025-01-01&endDate=2025-01-31"
```

### Get Conversion Analytics (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/analytics/conversions"
```

### Get Real-time Analytics (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/analytics/real-time"
```

### Export Analytics Data (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/analytics/export?startDate=2025-01-01&endDate=2025-01-31&type=outfit" \
  --output analytics-export.csv
```

### Track Page View
```bash
curl -X POST http://localhost:5000/api/track/page-view \
  -H "Content-Type: application/json" \
  -d '{
    "page": "/celebrities/taylor-swift",
    "title": "Taylor Swift - Celebrity Persona",
    "url": "https://celebritypersona.com/celebrities/taylor-swift",
    "userId": "user123",
    "sessionId": "session456",
    "duration": 45
  }'
```

### Track Custom Event
```bash
curl -X POST http://localhost:5000/api/track/event \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "newsletter_signup",
    "eventCategory": "engagement",
    "eventValue": 1,
    "userId": "user123",
    "sessionId": "session456"
  }'
```

### Create Celebrity (Admin)
```bash
curl -X POST http://localhost:5000/api/celebrities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Taylor Swift",
    "profession": "Singer",
    "category": "Music",
    "instagramHandle": "@taylorswift",
    "slug": "taylor-swift"
  }'
```

### Create Blog Post (Admin)
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Latest Fashion Trends 2025",
    "content": "Detailed blog content about fashion trends...",
    "excerpt": "Discover the hottest fashion trends for 2025",
    "category": "fashion",
    "tags": ["fashion", "trends", "2025"],
    "published": true,
    "featured": false,
    "relatedCelebrities": ["celebrity_id_1"]
  }'
```

### Moderate Content (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/moderate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blog",
    "id": "64a1b2c3d4e5f6789012345",
    "action": "approve"
  }'
```

## 🏷️ Tags System Features

### Tag Organization
- **Tag Types**: Categorize tags by type (general, style, color, occasion, brand, category, season)
- **Color Coding**: Visual organization with customizable hex colors
- **Usage Tracking**: Automatic usage count updates when content is tagged
- **Smart Search**: Full-text search across tag names and descriptions

### Content Organization
- **Multi-Tag Support**: Content can have multiple tags for better organization
- **Cross-Content Tagging**: Same tags can be used across celebrities, outfits, and blogs
- **Hierarchical Organization**: Tags help create content hierarchies and relationships
- **Trending Detection**: Identify trending tags based on recent content activity

### Tag Management
- **Popular Tags**: Identify most-used tags across the platform
- **Trending Tags**: Find tags gaining popularity in recent content
- **Tag Merging**: Combine duplicate or similar tags (Super Admin only)
- **Usage Maintenance**: Automatic and manual usage count updates
- **Tag Analytics**: Track tag performance and content association

### Admin Controls
- **Role-Based Access**: Different permissions for tag management
- **Bulk Operations**: Merge, update, and manage multiple tags
- **Content Association**: View all content associated with specific tags
- **Cleanup Tools**: Remove unused tags and maintain data quality

## 🔥 Trending System Features

### Smart Trending Detection
- **Multi-Factor Algorithm**: Combines clicks, unique users, sessions, and affiliate clicks
- **Weighted Scoring**: Different weights for different engagement types
- **Time-Based Analysis**: Configurable time periods (7, 14, 30 days)
- **Real-time Updates**: Trending content updates based on live user interactions

### Content-Specific Trending
- **Celebrity Trending**: Track trending celebrities based on profile views and clicks
- **Outfit Trending**: Monitor trending outfits with affiliate link performance
- **Blog Trending**: Identify trending blog posts by views and engagement
- **Category Filtering**: Get trending content within specific categories

### Trending Analytics
- **Trending Statistics**: Comprehensive stats across all content types
- **Performance Metrics**: Click counts, unique users, sessions, and trending scores
- **Historical Trends**: Track trending patterns over time
- **Cross-Content Analysis**: Compare trending performance across different content types

### Manual Control
- **Admin Override**: Manually set trending status for strategic content
- **Trending Management**: Admins can promote or demote trending content
- **Quality Control**: Ensure trending content meets quality standards
- **Strategic Promotion**: Feature important content regardless of organic performance

### Trending Features
- **Automatic Detection**: AI-driven trending identification based on user engagement
- **Multiple Time Periods**: Flexible trending periods from hours to months
- **Category-Based Trending**: Trending content within specific categories
- **Performance Scoring**: Advanced scoring algorithm considering multiple engagement factors
- **Manual Overrides**: Admin ability to manually set trending status
- **Real-time Updates**: Live trending updates based on user interactions

## 📧 Inquiry Management System

### Inquiry Submission
- **Contact Forms**: Professional contact form handling with validation
- **File Attachments**: Support for document and image attachments (PDF, DOC, images)
- **Multiple Types**: General, business, partnership, support, feedback, and press inquiries
- **Rate Limiting**: Anti-spam protection with 3 submissions per 15 minutes per IP
- **Metadata Capture**: Automatic capture of user agent, IP, referrer for tracking

### Inquiry Types & Prioritization
- **Inquiry Categories**: General, business, partnership, support, feedback, press
- **Auto-Prioritization**: Automatic priority assignment based on inquiry type
- **Manual Priority**: Admin ability to adjust priority (low, medium, high, urgent)
- **Smart Routing**: Intelligent assignment based on inquiry type and admin availability

### Admin Workflow Management
- **Assignment System**: Assign inquiries to specific admin team members
- **Status Tracking**: Pending, in-progress, resolved, closed status workflow
- **Response System**: Public and internal response capabilities
- **Internal Notes**: Private admin notes for collaboration and documentation
- **Follow-up Management**: Set follow-up dates and reminders

### Advanced Features
- **Bulk Operations**: Mass status updates, assignments, and actions
- **Advanced Search**: Full-text search across all inquiry fields
- **Export Capabilities**: CSV export with filtering options
- **Statistics Dashboard**: Comprehensive inquiry analytics and reporting
- **Public Status Check**: Allow users to check inquiry status with email + ID

### File Management
- **Secure Upload**: File validation and secure storage
- **Multiple Formats**: Support for images, documents, and PDFs
- **Size Limits**: 5MB max file size, 3 files per inquiry
- **Auto-Cleanup**: File deletion when inquiries are removed

### Privacy & Security
- **Data Protection**: GDPR-compliant data handling
- **Access Control**: Role-based access to inquiry management
- **Audit Trail**: Track all actions and changes on inquiries
- **Secure File Storage**: Protected file uploads with validation

## 📬 Newsletter Management System

### Email Subscription Management
- **Double Opt-in**: Secure email confirmation process to prevent spam
- **Advanced Preferences**: Frequency, content types, and interest-based segmentation
- **Multi-source Tracking**: Track subscription sources (website, mobile app, popup, etc.)
- **Rate Limiting**: Anti-spam protection with 5 subscriptions per 15 minutes per IP
- **Privacy Compliance**: GDPR-compliant subscription and unsubscribe processes

### Subscriber Segmentation
- **Interest-based Segments**: Fashion, celebrities, outfits, trends, beauty, lifestyle, events
- **Engagement Scoring**: Automatic calculation of engagement scores based on email interactions
- **Custom Tagging**: Admin ability to tag subscribers for targeted campaigns
- **Demographic Tracking**: Country, region, city, timezone, and language preferences
- **Behavioral Segmentation**: Highly engaged, engaged, moderately engaged, low engagement, new subscriber

### Email Engagement Tracking
- **Webhook Integration**: Real-time tracking of email opens, clicks, bounces, and complaints
- **Engagement Metrics**: Open rates, click rates, bounce rates, and complaint tracking
- **Deliverability Management**: Automatic handling of bounces and complaints
- **Performance Analytics**: Track email campaign performance and subscriber engagement
- **ROI Tracking**: Monitor newsletter effectiveness and subscriber value

### Advanced Features
- **Bulk Operations**: Mass subscriber management, tagging, and status updates
- **Advanced Search**: Full-text search across subscriber data and preferences
- **Export Capabilities**: CSV export with comprehensive subscriber data
- **Statistics Dashboard**: Real-time newsletter analytics and growth metrics
- **Admin Notes**: Internal notes for subscriber management and relationship tracking

### Subscription Management
- **Easy Unsubscribe**: One-click unsubscribe with reason tracking
- **Preference Center**: Allow subscribers to update their preferences without unsubscribing
- **Re-engagement**: Tools to win back inactive subscribers
- **Subscription History**: Track all subscription changes and interactions
- **Custom Fields**: Flexible custom data fields for advanced subscriber profiling

### Privacy & Compliance
- **GDPR Compliance**: Full compliance with data protection regulations
- **Data Retention**: Configurable data retention policies
- **Consent Management**: Track and manage subscriber consent
- **Right to be Forgotten**: Easy data deletion upon request
- **Audit Trails**: Complete history of subscriber interactions and data changes

## 📊 Advanced Analytics Features

### Overview Analytics
- **Current vs Previous Period**: Compare metrics with previous time periods
- **Content Statistics**: Total celebrities, outfits, blogs, and publication status
- **User Engagement**: Track unique users, page views, clicks, and custom events
- **Growth Metrics**: Monitor growth trends over time

### Traffic Analytics
- **Flexible Grouping**: Group data by hour, day, week, or month
- **Multi-metric Tracking**: Page views, clicks, events, unique users, and sessions
- **Time Series Data**: Historical trends and patterns
- **Real-time Updates**: Live traffic monitoring

### Content Performance
- **Top Performing Content**: Identify best-performing celebrities, outfits, and blogs
- **Engagement Metrics**: Track clicks, unique users, and session data
- **Content Insights**: Understand which content resonates with users
- **Performance Comparison**: Compare content performance over time

### User Behavior Analytics
- **Session Analysis**: Average session duration and pages per session
- **Bounce Rate**: Identify user engagement quality
- **Traffic Sources**: Top referrers and traffic origins
- **Device & Browser Stats**: Understand user demographics
- **User Journey**: Map user paths through the website

### Conversion Analytics
- **Affiliate Performance**: Track affiliate link clicks and conversions
- **Conversion Rates**: Calculate click-to-view and conversion rates
- **Revenue Tracking**: Monitor affiliate link performance
- **Top Converters**: Identify best-performing affiliate content

### Real-time Analytics
- **Live Metrics**: Current active users and page views
- **Recent Activity**: Latest user interactions and events
- **Hourly Trends**: Activity patterns throughout the day
- **Instant Updates**: Real-time data without caching delays

### Data Export
- **CSV Export**: Download analytics data for external analysis
- **Flexible Filtering**: Export specific date ranges and content types
- **Large Dataset Support**: Handle exports up to 10,000 records
- **Admin Controls**: Restrict export access to authorized users

## 🎯 Tracking & Analytics Features

### Event Tracking
- **Click Tracking**: Track clicks on celebrities, outfits, blogs, and affiliate links
- **Page View Tracking**: Monitor page visits and user engagement time
- **Custom Events**: Track newsletter signups, downloads, and other interactions
- **User Journey**: Follow user paths through the website

### Analytics Dashboard
- **Real-time Metrics**: Live tracking of user interactions
- **Popular Content**: Identify top-performing celebrities, outfits, and blogs
- **User Behavior**: Analyze user engagement patterns
- **Conversion Tracking**: Monitor affiliate link performance

### Data Management
- **Performance Optimized**: Indexed queries for fast analytics
- **Data Cleanup**: Automated cleanup of old tracking data
- **Privacy Compliant**: GDPR-friendly data handling
- **Export Capabilities**: Download analytics data for external analysis

## 🎯 Admin Dashboard Features

### Dashboard Statistics
- **Content Overview**: Total celebrities, outfits, blogs
- **Content Status**: Published vs unpublished content
- **Trending Items**: Currently trending content
- **Recent Activity**: Latest content creation activity
- **System Information**: Server uptime, Node version, environment
- **Analytics Summary**: Key performance metrics
- **Inquiry Overview**: Pending inquiries, response rates, priority distribution
- **Newsletter Metrics**: Subscriber count, engagement rates, growth trends

### Content Moderation
- **Approve/Reject**: Moderate blog posts and content
- **Feature Content**: Mark content as featured/trending
- **Bulk Operations**: Perform actions on multiple items
- **Content Search**: Find specific content to moderate

### Inquiry Management
- **Inquiry Dashboard**: Overview of all inquiries with filtering
- **Response Management**: Handle customer inquiries and responses
- **Assignment System**: Assign inquiries to team members
- **Follow-up Tracking**: Manage inquiry follow-ups and deadlines
- **Performance Metrics**: Track response times and resolution rates

### Newsletter Management
- **Subscriber Dashboard**: Overview of all newsletter subscribers
- **Engagement Analytics**: Track email open rates, click rates, and engagement
- **Segmentation Tools**: Manage subscriber segments and targeting
- **Campaign Analytics**: Monitor newsletter campaign performance
- **Growth Tracking**: Track subscriber acquisition and retention

### User Management (Super Admin)
- **Create Admins**: Add new administrative users
- **Role Assignment**: Assign roles and permissions
- **Account Status**: Activate/deactivate admin accounts
- **Activity Monitoring**: Track login activity

### Analytics & Reporting
- **Traffic Analysis**: Monitor website traffic and user behavior
- **Content Performance**: Track which content performs best
- **User Engagement**: Analyze user interaction patterns
- **Revenue Tracking**: Monitor affiliate link performance
- **Newsletter Performance**: Track email campaign effectiveness
- **Advanced Reports**: Generate detailed analytics reports
- **Data Export**: Export analytics data for further analysis

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_extremely_long_and_secure_secret_key_for_production_use_only
REDIS_URL=redis://your-redis-url:6379
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret (64+ characters)
- [ ] Configure MongoDB Atlas with authentication
- [ ] Set up Redis cache
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure logging and monitoring
- [ ] Set up image optimization
- [ ] Configure CDN for static assets
- [ ] Set up automated backups
- [ ] Configure error tracking (Sentry)
- [ ] Set up analytics data retention policies
- [ ] Configure database indexes for analytics performance
- [ ] Set up inquiry notification system
- [ ] Configure file storage and backup
- [ ] Set up email service provider integration
- [ ] Configure newsletter delivery service
- [ ] Set up email engagement tracking webhooks

## 📁 Project Structure

```
celebrity-persona-backend/
├── controllers/           # Route controllers
│   ├── celebrityController.js
│   ├── outfitController.js
│   ├── blogController.js
│   ├── adminController.js
│   ├── trackController.js
│   ├── analyticsController.js
│   ├── tagController.js
│   ├── trendingController.js
│   ├── inquiryController.js
│   ├── newsletterController.js
│   └── ...
├── middleware/           # Custom middleware
│   ├── errorHandler.js
│   ├── validation.js
│   ├── cache.js
│   ├── auth.js          # Authentication middleware
│   └── upload.js
├── models/              # MongoDB models
│   ├── Celebrity.js
│   ├── Outfit.js
│   ├── Blog.js
│   ├── Admin.js
│   ├── Track.js
│   ├── Tag.js
│   ├── Inquiry.js
│   ├── Newsletter.js
│   └── ...
├── routes/              # API routes
│   ├── celebrityRoutes.js
│   ├── outfitRoutes.js
│   ├── blogRoutes.js
│   ├── adminRoutes.js
│   ├── trackRoutes.js
│   ├── analyticsRoutes.js
│   ├── tagRoutes.js
│   ├── trendingRoutes.js
│   ├── inquiryRoutes.js
│   ├── newsletterRoutes.js
│   └── ...
├── utils/               # Utility functions
│   ├── apiResponse.js
│   └── logger.js
├── uploads/             # File uploads
│   └── inquiries/       # Inquiry attachments
├── logs/                # Application logs
├── config/              # Configuration files
│   └── db.js
├── .env                 # Environment variables
├── server.js            # Main application file
└── package.json         # Dependencies
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📈 Performance

- **Caching Strategy**:
  - Celebrities: 5 minutes
  - Outfits: 5 minutes
  - Blogs: 5 minutes
  - Featured/Popular content: 10 minutes
  - Dashboard stats: 5 minutes
  - Popular tracking data: 10 minutes
  - Overview analytics: 5 minutes
  - Traffic analytics: 3 minutes
  - User behavior analytics: 10 minutes
  - Tags: 10 minutes
  - Popular tags: 10 minutes
  - Trending tags: 5 minutes
  - Trending content: 5 minutes
  - Trending stats: 10 minutes
  - Newsletter stats: 10 minutes
- **Database Optimization**: Indexed queries and aggregation pipelines
- **Compression**: Gzip compression enabled
- **Rate Limiting**: Protects against abuse and DDoS
- **Image Optimization**: Multer for efficient file uploads
- **Memory Management**: Proper cleanup and garbage collection
- **Analytics Performance**: Optimized tracking queries with compound indexes

## 🔄 Content & Analytics Workflow

### Content Management Workflow
1. **Content Creation**: Admins create celebrities, outfits, and blogs
2. **Tag Assignment**: Content is organized using relevant tags
3. **Content Review**: Moderators review and approve content
4. **Publication**: Approved content becomes publicly visible
5. **Feature Management**: Mark important content as featured/trending
6. **Performance Monitoring**: Track content engagement through analytics

### Inquiry Management Workflow
1. **Inquiry Submission**: Users submit inquiries through the contact form
2. **Auto-Assignment**: System automatically assigns priority and routing
3. **Admin Review**: Admin team reviews and assigns inquiries
4. **Response & Resolution**: Admins respond to inquiries and track progress
5. **Follow-up Management**: Track follow-ups and ensure customer satisfaction
6. **Analytics & Reporting**: Generate reports on inquiry performance

### Newsletter Management Workflow
1. **Subscription**: Users subscribe with interests and preferences
2. **Email Confirmation**: Double opt-in process to verify email addresses
3. **Segmentation**: Automatic subscriber segmentation based on interests and engagement
4. **Campaign Creation**: Admin creates targeted newsletter campaigns
5. **Email Delivery**: Newsletters sent based on subscriber preferences
6. **Engagement Tracking**: Track opens, clicks, and subscriber engagement
7. **Analytics & Optimization**: Use engagement data to improve campaigns

### Trending Content Workflow
1. **Automatic Detection**: System identifies trending content based on user engagement
2. **Algorithm Processing**: Multi-factor algorithm calculates trending scores
3. **Content Ranking**: Content is ranked by trending score and engagement metrics
4. **Manual Override**: Admins can manually promote strategic content to trending
5. **Performance Tracking**: Monitor trending content performance over time
6. **Trending Rotation**: Natural rotation as new content gains traction

### Analytics Workflow
1. **Event Tracking**: Automatic tracking of user interactions
2. **Data Processing**: Real-time aggregation of analytics data
3. **Report Generation**: Generate insights from tracking data
4. **Performance Optimization**: Use analytics to improve content strategy
5. **Data Maintenance**: Regular cleanup of old tracking data

### Tag Management Workflow
1. **Tag Creation**: Admins create and organize tags by type and purpose
2. **Content Tagging**: Assign relevant tags to celebrities, outfits, and blogs
3. **Usage Tracking**: Automatic tracking of tag usage across content
4. **Trend Analysis**: Identify trending tags and popular content themes
5. **Tag Optimization**: Merge duplicate tags and maintain tag quality

### User Engagement Tracking
1. **Page Load**: Track page views and load times
2. **Content Interaction**: Monitor clicks on celebrities, outfits, blogs
3. **Tag-based Navigation**: Track user behavior through tag-based content discovery
4. **Newsletter Engagement**: Track newsletter subscriptions and email interactions
5. **Affiliate Tracking**: Track affiliate link clicks and conversions
6. **User Journey**: Map complete user paths through the website

### Analytics Reporting Workflow
1. **Data Collection**: Continuous tracking of user interactions
2. **Data Aggregation**: Process raw tracking data into meaningful metrics
3. **Report Generation**: Create overview, traffic, and performance reports
4. **Insights Delivery**: Present actionable insights to stakeholders
5. **Strategy Optimization**: Use analytics to improve content and user experience

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Your Name - [@yourhandle](https://twitter.com/yourhandle) - email@example.com

Project Link: [https://github.com/yourusername/celebrity-persona-backend](https://github.com/yourusername/celebrity-persona-backend)

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the database
- Redis for caching solution
- JWT.io for authentication standards
- All open source contributors

---

## 📋 API Quick Reference

### Quick Test Commands
```bash
# Health Check
curl http://localhost:5000/api/health

# Get Celebrities
curl http://localhost:5000/api/celebrities

# Get Outfits
curl http://localhost:5000/api/outfits

# Get Blogs
curl http://localhost:5000/api/blogs

# Get All Tags
curl http://localhost:5000/api/tags

# Get Popular Tags
curl http://localhost:5000/api/tags/popular?limit=10

# Search Tags
curl "http://localhost:5000/api/tags/search?q=fashion"

# Get Content by Tag
curl http://localhost:5000/api/tags/TAG_ID/content

# Get All Trending Content
curl http://localhost:5000/api/trending

# Get Trending Celebrities
curl "http://localhost:5000/api/trending/celebrities?limit=10"

# Get Trending Outfits
curl "http://localhost:5000/api/trending/outfits?category=dress"

# Get Trending Blogs
curl "http://localhost:5000/api/trending/blogs?period=14"

# Get Trending Statistics
curl "http://localhost:5000/api/trending/stats?period=30"

# Submit Inquiry
curl -X POST http://localhost:5000/api/inquiry/submit \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "subject": "Partnership", "message": "Hello!"}'

# Check Inquiry Status
curl "http://localhost:5000/api/inquiry/status?email=john@example.com&inquiryId=INQUIRY_ID"

# Subscribe to Newsletter
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "name": "John Doe", "interests": ["fashion", "celebrities"]}'

# Confirm Newsletter Subscription
curl "http://localhost:5000/api/newsletter/confirm/CONFIRMATION_TOKEN"

# Unsubscribe from Newsletter
curl -X POST http://localhost:5000/api/newsletter/unsubscribe/UNSUBSCRIBE_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"reason": "too_frequent"}'

# Track Click Event
curl -X POST http://localhost:5000/api/track/click \
  -H "Content-Type: application/json" \
  -d '{"type": "outfit", "targetId": "OUTFIT_ID", "userId": "user123"}'

# Get Popular Content
curl http://localhost:5000/api/track/popular?limit=5

# Admin Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# Create Tag (with token)
curl -X POST http://localhost:5000/api/tags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Summer Fashion", "type": "season", "color": "#ff6b6b"}'

# Set Trending Status (with token)
curl -X POST http://localhost:5000/api/trending/set-status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "celebrity", "id": "CELEBRITY_ID", "trending": true}'

# Get All Inquiries (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/inquiry?status=pending&limit=20"

# Get All Newsletter Subscribers (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/newsletter?status=active&limit=20"

# Update Inquiry Status (with token)
curl -X PUT http://localhost:5000/api/inquiry/INQUIRY_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress", "priority": "high"}'

# Get Dashboard (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/dashboard

# Get Overview Analytics (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/overview

# Get Traffic Analytics (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/analytics/traffic?groupBy=day"

# Get Real-time Analytics (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/real-time

# Export Analytics (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/analytics/export?type=outfit" \
  --output analytics.csv

# Export Newsletter Subscribers (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/newsletter/export?format=csv" \
  --output subscribers.csv
```

## 🔒 Security Best Practices

- Always use HTTPS in production
- Implement proper input validation
- Use strong, unique JWT secrets
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement proper logging and monitoring
- Use environment variables for sensitive data
- Implement account lockout for failed login attempts
- Sanitize tracking data to prevent XSS attacks
- Implement rate limiting for tracking endpoints
- Secure analytics endpoints with proper authentication
- Implement data export access controls
- Validate tag input to prevent malicious content
- Implement proper authorization for tag management
- Secure trending endpoints from manipulation
- Validate trending status updates
- Secure file uploads with validation and size limits
- Implement inquiry rate limiting to prevent spam
- Validate and sanitize all inquiry input fields
- Secure inquiry file attachments
- Implement newsletter subscription rate limiting
- Validate and sanitize newsletter data
- Secure email engagement tracking endpoints
- Implement proper newsletter unsubscribe handling

## 📊 Analytics & Privacy

- **Data Collection**: Only collect necessary user interaction data
- **Privacy Compliance**: GDPR and CCPA compliant data handling
- **Data Retention**: Automatic cleanup of old tracking data
- **Anonymization**: Option to anonymize user data
- **Opt-out**: Respect user privacy preferences
- **Secure Access**: Analytics data protected by authentication
- **Data Export Controls**: Restrict analytics export to authorized users
- **Audit Trails**: Log access to sensitive analytics data
- **Tag Privacy**: Ensure tags don't contain sensitive user information
- **Trending Privacy**: Protect user data in trending calculations
- **Inquiry Privacy**: Secure handling of personal inquiry data
- **File Security**: Secure storage and access to inquiry attachments
- **Newsletter Privacy**: GDPR-compliant newsletter subscription and data handling
- **Email Privacy**: Secure email engagement tracking and subscriber data
- **Consent Management**: Track and manage newsletter subscription consent
- **Data Portability**: Easy data export for subscriber data requests

Ready for production! 🚀