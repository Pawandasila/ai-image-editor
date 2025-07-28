# 🎨 Pixxel - AI-Powered Image Editor

A modern, full-stack AI image editing platform built with Next.js, featuring real-time canvas editing, AI-powered transformations, and professional-grade image processing tools.

![Landing Page](https://github.com/user-attachments/assets/9a2dbf8f-6b48-43aa-85a4-d5d5922d70a1)

## 📸 Screenshots

<details>
<summary>🖥️ View Application Screenshots</summary>

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/5454d133-9c04-4d1c-b15a-8b793782db8f)
*Project management and organization*

### Image Editor
![Editor Interface](https://github.com/user-attachments/assets/77d198ad-1c15-4bae-948a-ceff6aeda1d6)
*Professional editing interface with AI tools*

### Adding a New Project
![Adding New Project](https://github.com/user-attachments/assets/5b72799f-33fe-4b06-9060-2479e4fb13b0)
*Creating new projects and managing folders*

</details>

## ✨ Features

### 🤖 AI-Powered Tools
- **AI Enhance**: Neural-powered image enhancement for quality improvement
- **AI Generate**: Create stunning images from text prompts
- **Magic Erase**: Intelligent object removal with context-aware filling
- **Super Scale**: AI upscaling while preserving details
- **Background Removal**: Precise background extraction

### 🎛️ Professional Editing Tools
- **Advanced Adjustments**: Exposure, brightness, contrast, saturation, vibrance, hue rotation
- **Color Grading**: Temperature control, sepia, grayscale effects
- **Detail Enhancement**: Sharpen, blur, noise, gamma correction
- **Canvas Tools**: Crop, resize, rotate, layers management
- **Text Tools**: Typography with custom fonts and styling

### 📁 Project Organization
- **Smart Folders**: Create custom folders to organize your projects
- **Folder Navigation**: Intuitive sidebar navigation with breadcrumb trails
- **Project Assignment**: Assign projects to folders during creation or move them later
- **Folder Management**: Create, rename, and delete folders with automatic project handling
- **Visual Organization**: Clean dashboard view showing projects by folder or all projects

### 🚀 Platform Features
- **Project Organization**: Folder-based project management with drag-and-drop organization
- **Real-time Collaboration**: Live canvas updates
- **Cloud Storage**: Secure project saving with Convex database
- **Image Pipeline**: ImageKit integration for optimized processing
- **Authentication**: Clerk-powered user management
- **Subscription Plans**: Free and Pro tiers with usage tracking
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Canvas Engine**: Fabric.js for advanced image manipulation
- **UI Components**: Shadcn/ui with Radix primitives
- **Backend**: Convex (real-time database and functions)
- **Authentication**: Clerk (user management + billing)
- **Image Processing**: ImageKit (CDN + transformations)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-image-editor.git
   cd ai-image-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your actual API keys:

   ```env
   # Convex Database
   CONVEX_DEPLOYMENT=your-deployment-name
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   CLERK_JWT_ISSUER_DOMAIN=your-domain.clerk.accounts.dev

   # ImageKit CDN
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_...
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id/
   IMAGEKIT_PRIVATE_KEY=private_...

   # Unsplash (Optional)
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your-access-key
   ```

   > 📝 **Note**: See `.env.example` for detailed setup instructions and all available configuration options.

4. **Set up Convex**
   ```bash
   npx convex dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ai-image/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (main)/                   # Main application
│   │   ├── dashboard/            # User dashboard
│   │   │   └── _components/      # Dashboard components
│   │   │       ├── folder-sidebar.jsx      # Folder navigation
│   │   │       ├── new-project-modal.jsx   # Project creation with folder support
│   │   │       ├── project-grid.jsx        # Project display grid
│   │   │       └── project-card.jsx        # Individual project cards
│   │   └── editor/[projectId]/   # Image editor
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   ├── features.jsx              # Landing page features
│   ├── pricing.jsx               # Pricing section
│   └── ...
├── convex/                       # Backend functions & schema
│   ├── projects.js               # Project CRUD & folder operations
│   ├── users.js                  # User management & plan handling
│   └── schema.js                 # Database schema (users, projects, folders)
├── context/                      # React contexts
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
└── public/                       # Static assets
```

## 🎨 Key Components

### Dashboard & Organization
- **Folder Sidebar**: Hierarchical project organization with folder management
- **Project Grid**: Visual project browser with folder filtering
- **Breadcrumb Navigation**: Clear navigation path showing current folder location
- **Project Assignment**: Seamless project-to-folder assignment during creation

### Canvas Editor
- **Fabric.js Integration**: Advanced canvas manipulation
- **Real-time Updates**: Live collaboration features  
- **Layer Management**: Object hierarchy and organization
- **Tool System**: Modular editing tools architecture

### AI Tools System
- **Pluggable Architecture**: Easy to add new AI features
- **Processing Queue**: Background job management
- **Progress Tracking**: Real-time operation status
- **Error Handling**: Robust error recovery

### Image Pipeline
- **Upload Processing**: Multi-format support
- **Transformation Chain**: Non-destructive editing
- **Optimization**: Automatic quality and size optimization
- **CDN Integration**: Global image delivery

## 🔧 Configuration

### Database Schema
The application uses Convex with the following main tables:
- `users`: User profiles and subscription data
- `projects`: Image editing projects and canvas state
- `folders`: Project organization and folder management

### Plan Limits
- **Free Plan**: 3 projects, 20 exports/month, basic tools
- **Pro Plan**: Unlimited projects/exports, all AI features

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fabric.js](http://fabricjs.com/) for the powerful canvas library
- [ImageKit](https://imagekit.io/) for image processing and CDN
- [Convex](https://convex.dev/) for the real-time backend
- [Clerk](https://clerk.dev/) for authentication and billing
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## 📞 Support

- 📧 Email: support@pixxel.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ai-image-editor/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/ai-image-editor/discussions)

---

<p align="center">Made with ❤️ by the Pixxel Team</p>
