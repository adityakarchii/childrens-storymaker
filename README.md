# Storybook - AI-Powered Children's Story Generator

An innovative web application that transforms simple prompts into beautifully illustrated children's stories using Google's Gemini AI, complete with images and narration.

## 🌟 Features

### Phase 1: Core AI Backend
- **Story Generation**: Uses Google Gemini API to create engaging children's stories from prompts
- **Image Generation**: Integrates with DALL-E 3 or Stability AI for custom illustrations
- **Audio Narration**: Google Cloud Text-to-Speech for natural voice narration
- **Multi-modal AI**: Seamless integration between text, image, and audio generation

### Phase 2: Frontend & User Interface
- **Interactive Storybook Viewer**: Beautiful, page-turning interface
- **Real-time Generation Tracking**: Progress indicators and status updates
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **User Authentication**: Account creation and story management

### Phase 3: Infrastructure & Sharing
- **Cloud Storage**: Automatic image and audio file management
- **Story Sharing**: Public sharing with unique URLs
- **User Dashboard**: Personal story library and management
- **Export Features**: PDF generation and sharing capabilities

## 🚀 Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Google Gemini API** for story generation
- **OpenAI DALL-E 3** / **Stability AI** for image generation
- **Google Cloud Text-to-Speech** for narration
- **Cloudinary** / **Google Cloud Storage** for file management

### Frontend
- **React** with hooks and modern patterns
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Framer Motion** for animations
- **Styled Components** for dynamic styling

### APIs & Services
- Google Gemini API
- OpenAI API (DALL-E 3)
- Stability AI API
- Google Cloud Text-to-Speech
- Cloudinary API
- Google Cloud Storage

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (version 16 or higher)
- **MongoDB (automatically installed with setup below)**
- API keys for:
  - Google Gemini API
  - OpenAI API (optional)
  - Google Cloud TTS (optional)
  - Cloudinary (optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adityakarchii/gemini-storybook-app.git
   cd gemini-storybook-app
   ```

2. **Install dependencies for all packages**
   ```bash
   npm install
   ```

3. **Install MongoDB (Windows)**
   MongoDB will be installed automatically using Windows Package Manager:
   ```bash
   winget install MongoDB.Server
   winget install MongoDB.Compass.Full
   ```

4. **Set up environment variables**
   
   Copy the example environment file and configure your API keys:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` with your actual API keys and configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/gemini-storybook
   JWT_SECRET=your-jwt-secret
   
   # Required for AI story generation
   GEMINI_API_KEY=your-gemini-api-key
   
   # Optional but recommended
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. **Start MongoDB**
   ```bash
   # Use the provided script (recommended)
   .\start-mongodb.bat
   
   # Or manually:
   "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "./mongodb-data" --port 27017
   ```

## 🚀 Running the Application

### Development Mode
Run both frontend and backend concurrently:
\`\`\`bash
npm run dev
\`\`\`

### Individual Services
Run backend only:
\`\`\`bash
npm run server
\`\`\`

Run frontend only:
\`\`\`bash
npm run client
\`\`\`

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

## 📖 Usage

1. **Create a Story**
   - Navigate to \`/create\`
   - Enter a story prompt (e.g., "A brave little mouse who learns to fly")
   - Customize options (age group, genre, art style)
   - Click "Generate Story" and wait for the magic!

2. **View Stories**
   - Watch real-time generation progress
   - Navigate through pages with interactive controls
   - Listen to AI-generated narration
   - Share your favorite stories

3. **Manage Your Library**
   - View all your created stories in \`/my-stories\`
   - Make stories public to share with the community
   - Export stories as PDFs

## 🔧 API Endpoints

### Story Generation
- \`POST /api/ai/generate-story\` - Start complete story generation
- \`GET /api/ai/story/:id/status\` - Check generation progress
- \`GET /api/ai/story/:id\` - Get complete story
- \`POST /api/ai/generate-text\` - Generate story text only
- \`POST /api/ai/generate-image\` - Generate single image
- \`POST /api/ai/generate-audio\` - Generate single audio

### Story Management
- \`GET /api/stories\` - Get user's stories
- \`GET /api/stories/public\` - Get public stories
- \`PUT /api/stories/:id\` - Update story
- \`DELETE /api/stories/:id\` - Delete story
- \`GET /api/shared/:shareId\` - Get shared story

### Authentication
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/me\` - Get current user
- \`PUT /api/auth/profile\` - Update profile

## 🏗️ Project Structure

\`\`\`
gemini-storybook-app/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # AI and external services
│   ├── middleware/      # Authentication, validation
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Route components
│   │   ├── store/       # Redux store and slices
│   │   ├── services/    # API calls
│   │   └── App.js       # Main App component
│   └── public/          # Static assets
└── package.json         # Root package configuration
\`\`\`

## 🎨 Customization

### Story Options
- **Age Groups**: Toddlers, Preschool, Elementary, Middle Grade
- **Genres**: Adventure, Fantasy, Educational, Friendship, Animals
- **Art Styles**: Watercolor, Cartoon, Realistic, Sketch, Digital Art
- **Page Count**: 4-16 pages per story

### Voice Options
- Multiple natural-sounding voices
- Different languages and accents
- Adjustable speaking speed and pitch

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the frontend: \`npm run build\`
2. Deploy the \`build\` folder to your hosting service
3. Configure environment variables for API URL

### Backend (Heroku/Railway/DigitalOcean)
1. Set up environment variables on your hosting platform
2. Configure MongoDB connection
3. Deploy the backend folder
4. Set up file storage (Cloudinary recommended)

### Environment Variables
Make sure to configure all required environment variables in your production environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini team for the incredible AI capabilities
- OpenAI for DALL-E 3 image generation
- The React and Node.js communities
- All the storytellers who inspire creativity

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/adityakarchii/gemini-storybook-app/issues) page
2. Create a new issue with detailed information
3. Contact: [your-email@example.com]

---

**Happy Storytelling!** ✨📚🎨
