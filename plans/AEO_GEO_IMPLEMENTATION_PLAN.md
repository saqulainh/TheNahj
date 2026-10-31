# AEO & GEO Implementation Plan

## Executive Summary
This plan outlines the implementation of enhanced Administrative/Organizational (AEO) structures and Geographical/Location (GEO) metadata for TheNahj platform.

---

## Phase 1: AEO - Administrative Structure Enhancements

### 1.1 Role-Based Access Control (RBAC)

**Current State:**
- Simple admin/authenticated binary
- No granular role management

**Implementation:**
1. Create `user_roles` table:
   ```sql
   CREATE TABLE user_roles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id),
     role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor', 'reviewer', 'viewer')),
     permissions JSONB DEFAULT '[]'::jsonb,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```

2. Add role-based policies to all tables
3. Create role management API endpoints:
   - `GET /api/admin/roles` - List roles
   - `POST /api/admin/roles` - Create role
   - `PUT /api/admin/roles/:id` - Update role
   - `DELETE /api/admin/roles/:id` - Delete role

4. Update admin UI with role management panel

### 1.2 Audit Logging

**Implementation:**
1. Create `audit_logs` table:
   ```sql
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     action TEXT NOT NULL,
     entity_type TEXT NOT NULL,
     entity_id UUID,
     old_data JSONB,
     new_data JSONB,
     ip_address INET,
     user_agent TEXT,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

2. Create audit middleware to log all admin actions
3. Add audit log viewer to admin dashboard

### 1.3 Content Approval Workflow

**Implementation:**
1. Add `approval_status` field to `articles_unified`:
   ```sql
   ALTER TABLE articles_unified 
   ADD COLUMN approval_status TEXT DEFAULT 'pending' 
   CHECK (approval_status IN ('pending', 'approved', 'rejected', 'published'));
   ```

2. Create approval workflow API:
   - `POST /api/admin/approve/:articleId` - Approve content
   - `POST /api/admin/reject/:articleId` - Reject with reason
   - `GET /api/admin/pending-approvals` - List pending items

3. Add approval UI to admin studio

---

## Phase 2: GEO - Geographical Metadata Implementation

### 2.1 Database Schema Changes

**Implementation:**
1. Add geographical fields to `articles_unified`:
   ```sql
   ALTER TABLE articles_unified 
   ADD COLUMN region TEXT,
   ADD COLUMN country TEXT,
   ADD COLUMN city TEXT,
   ADD COLUMN timezone TEXT,
   ADD COLUMN target_regions TEXT[] DEFAULT '{}',
   ADD COLUMN locale TEXT DEFAULT 'en';
   ```

2. Create `geo_regions` reference table:
   ```sql
   CREATE TABLE geo_regions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     code TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     country_code TEXT,
     region_code TEXT,
     timezone TEXT,
     language_codes TEXT[] DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

3. Seed initial regions:
   - South Asia (IN, PK, BD)
   - Middle East (SA, IR, IQ)
   - Global (default)

### 2.2 API Endpoints

**Implementation:**
1. Create geo-related endpoints:
   - `GET /api/geo/regions` - List all regions
   - `GET /api/geo/regions/:code` - Get region details
   - `POST /api/geo/regions` - Create region (admin)
   - `PUT /api/geo/regions/:id` - Update region (admin)

2. Update content API to support geo filtering:
   - `GET /api/content?region=IN&country=India`
   - `GET /api/content?locale=ur`

3. Add geo metadata to content responses

### 2.3 Admin UI Updates

**Implementation:**
1. Add geo fields to content studio form:
   - Region dropdown
   - Country dropdown
   - City input
   - Timezone selector
   - Target regions multi-select
   - Locale selector

2. Create geo management panel:
   - Region list with CRUD
   - Region statistics
   - Content distribution by region

### 2.4 SEO/GEO Optimization

**Implementation:**
1. Add hreflang tags for multilingual content:
   ```html
   <link rel="alternate" hreflang="en" href="https://thenahj.live/wisdom/article-slug" />
   <link rel="alternate" hreflang="ur" href="https://thenahj.live/ur/wisdom/article-slug" />
   <link rel="alternate" hreflang="ar" href="https://thenahj.live/ar/wisdom/article-slug" />
   ```

2. Add geo metadata to JSON-LD:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "Article",
     "headline": "...",
     "inLanguage": "en",
     "contentLocation": {
       "@type": "Place",
       "name": "South Asia"
     }
   }
   ```

3. Update robots.txt with geo-specific rules if needed

4. Add geo-based sitemap generation

---

## Phase 3: Integration & Testing

### 3.1 Database Migrations
1. Create migration files for all schema changes
2. Add indexes for geo fields
3. Update RLS policies for new tables

### 3.2 API Testing
1. Unit tests for new endpoints
2. Integration tests for geo filtering
3. Load testing for performance

### 3.3 UI Testing
1. Test admin role management
2. Test approval workflow
3. Test geo metadata input
4. Test content filtering by region

### 3.4 Documentation
1. Update ARCHITECTURE.md
2. Update PROJECT_CONTEXT.md
3. Create API documentation
4. Create admin guide for new features

---

## Implementation Order

1. **Week 1-2:** Database schema changes + migrations
2. **Week 3-4:** API endpoints + business logic
3. **Week 5-6:** Admin UI updates
4. **Week 7-8:** SEO/GEO optimization
5. **Week 9-10:** Testing + documentation

---

## Success Metrics

- Admin can manage roles and permissions
- Content can be tagged with geographical metadata
- Users can filter content by region/locale
- SEO performance improves with hreflang and geo metadata
- Audit trail captures all admin actions
- Approval workflow enforces content quality

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database migration downtime | High | Use online schema changes, test in staging |
| Performance degradation | Medium | Add proper indexes, cache geo lookups |
| Complex UI changes | Medium | Phase rollout, user testing |
| SEO breakage | High | Monitor search console, gradual rollout |

---

## Next Steps

1. Review this plan with stakeholders
2. Prioritize features based on business needs
3. Create detailed task breakdown
4. Assign to development team
5. Set up staging environment for testing