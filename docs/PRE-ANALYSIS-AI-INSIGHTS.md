# Pre Analysis (AI Insights) — Documentation

## 1. Tech Stack Used
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Next.js API routes, Node.js
- **Database:** PostgreSQL (Neon serverless)
- **AI/ML:** Google Generative AI (Gemini), Google Vision API
- **Authentication:** JWT, custom permissions
- **Deployment:** Vercel/Node server
- **Other:** Lucide-react icons, custom hooks, utility libraries

---

## 2. Process Flow
1. **User Action:**
   - User navigates to Dashboard → Analytics → Pre-analysis.
   - User clicks the “Pre-analysis” button/component.
2. **Data Fetching:**
   - Frontend sends a request to `/api/analytics/pre-analysis`.
   - API authenticates user and checks permissions.
3. **Data Preparation:**
   - Backend queries student, company, and employment data from PostgreSQL.
   - Cleans, aggregates, and formats data for analysis.
4. **AI Insights Generation:**
   - Backend sends relevant data to Google Generative AI (Gemini) for analysis.
   - Optionally, Google Vision API is used for document/image-based insights.
   - AI model returns predictions, trends, and strategic recommendations.
5. **Response Handling:**
   - Backend parses AI response and structures it for frontend consumption.
   - Sends insights, predictions, and visualizations to frontend.
6. **UI Display:**
   - Frontend renders insights in a modern, interactive dashboard.
   - Includes charts, badges, and summary cards for strategic planning.

---

## 3. Methodology
- **Data Aggregation:**
  - Collects and summarizes key metrics (student demographics, employment rates, qualification trends).
- **AI Analysis:**
  - Uses LLMs (Gemini) to identify patterns, forecast outcomes, and suggest strategies.
  - Employs prompt engineering for targeted insights (e.g., “What are the top job categories for next year?”).
- **Visualization:**
  - Presents actionable insights using charts, graphs, and badges.
  - Highlights strategic recommendations for admins and planners.

---

## 4. Component Features
- **AI-powered predictions:**
  - Future employment trends, qualification gaps, strategic opportunities.
- **Interactive UI:**
  - Clickable cards, dynamic charts, export options.
- **Role-based access:**
  - Only authorized users can view or trigger AI insights.

---

## 5. Example Use Case
- Admin clicks “Pre-analysis” →
  - Sees AI-generated summary: “Projected 20% increase in IT job placements next year. Recommend upskilling in software development.”
- Can use insights for planning, reporting, and decision-making.

---

## 6. Technical Details

### Stack & Integration
- **Frontend:**
  - Next.js 14 (App Router, SSR/ISR)
  - React functional components, hooks (`useEffect`, `useState`)
  - Tailwind CSS for styling
  - Radix UI for charts, badges, separators
  - API calls via `fetch` or custom hooks
- **Backend:**
  - Next.js API route: `/api/analytics/pre-analysis`
  - Node.js, TypeScript
  - JWT authentication (`verifyToken`)
  - Permission checks (`hasPermission`)
  - Data queries via Neon/PostgreSQL (`sql` from `@neondatabase/serverless`)
- **AI/ML Integration:**
  - Google Generative AI (Gemini) via REST API
  - Data sent as JSON payloads, prompt engineering for context
  - Response parsed for insights, predictions, and recommendations

### Process Flow (Detailed)
1. **User Clicks Pre-analysis:**
   - Triggers a React event handler (e.g., `onClick`).
2. **API Request:**
   - Frontend sends a `POST` or `GET` request to `/api/analytics/pre-analysis` with JWT in headers.
3. **Authentication & Authorization:**
   - API route extracts and verifies JWT.
   - Checks user role/permissions for access.
4. **Data Aggregation:**
   - SQL queries aggregate student, employment, and company data:
     ```sql
     SELECT COUNT(*) FROM students WHERE status = 'active';
     SELECT job_category, COUNT(*) FROM employees GROUP BY job_category;
     ```
   - Data is cleaned and formatted for AI input.
5. **AI Prompt Construction:**
   - Backend builds a prompt:
     ```json
     {
       "prompt": "Analyze student and employment data for strategic planning. What trends and predictions can you provide?",
       "data": { ...aggregated metrics... }
     }
     ```
   - Sends to Gemini API endpoint.
6. **AI Response Handling:**
   - Receives JSON with insights, e.g.:
     ```json
     {
       "summary": "IT jobs projected to grow 20%. Recommend upskilling.",
       "charts": [ ... ],
       "recommendations": [ ... ]
     }
     ```
   - Backend parses and structures response.
7. **Frontend Rendering:**
   - Insights displayed in dashboard:
     - Summary cards
     - Bar/line charts (Radix UI or Chart.js)
     - Badges for recommendations
     - Export/print options (if enabled)

### Methodology
- **Data Preparation:**
  - Remove outliers, normalize fields, aggregate by category/district.
- **Prompt Engineering:**
  - Contextual prompts for LLMs, e.g. “Based on current student data, what are the top 3 strategic priorities?”
- **AI Model Selection:**
  - Gemini for text-based insights, Vision API for document/image analysis.
- **Result Validation:**
  - Backend checks for empty/invalid AI responses, logs errors.

### Security & Permissions
- Only users with `VIEW_ANALYTICS` or `ADMIN` roles can access pre-analysis.
- JWT required for all API requests.
- Sensitive data (student info) is not exposed in frontend unless authorized.

### Error Handling
- API returns structured error messages for:
  - Invalid token
  - Insufficient permissions
  - AI API failures
  - Data query errors

### Extensibility
- Easily add new metrics or AI models by updating backend prompt/data aggregation.
- Frontend supports dynamic chart types and new insight cards.

---
