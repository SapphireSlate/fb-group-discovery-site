import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'API Documentation - Facebook Group Finder',
  description: 'Documentation for the Facebook Group Finder API',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
        
        <div className="mb-8">
          <p className="mb-4">
            The Facebook Group Finder API provides programmatic access to groups, categories, tags, 
            and user data. This documentation explains how to use the available endpoints.
          </p>
        </div>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
          <p className="mb-4">
            Most API endpoints require authentication. To authenticate, include your session cookie with each request.
            You can obtain a session by signing in through the web interface.
          </p>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Groups</h2>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">List Groups</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">GET /api/groups</code>
            <p className="mb-2">Retrieve a list of Facebook groups with pagination and filtering options.</p>
            
            <h4 className="font-medium mt-4 mb-2">Query Parameters:</h4>
            <ul className="list-disc pl-6 mb-4">
              <li><code>category</code> - Filter by category ID</li>
              <li><code>tag</code> - Filter by tag ID</li>
              <li><code>sort</code> - Sort by: newest, popular, rating (default: newest)</li>
              <li><code>limit</code> - Number of results per page (default: 10)</li>
              <li><code>page</code> - Page number for pagination (default: 1)</li>
            </ul>
            
            <h4 className="font-medium mt-4 mb-2">Example Response:</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify({
                groups: [
                  {
                    id: "123",
                    name: "Digital Marketing Experts",
                    description: "A group for digital marketing professionals",
                    // More fields...
                  }
                ],
                pagination: {
                  total: 100,
                  page: 1,
                  limit: 10,
                  pages: 10
                }
              }, null, 2)}
            </pre>
          </div>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">Get Group Details</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">GET /api/groups/{'{id}'}</code>
            <p className="mb-2">Retrieve detailed information about a specific group.</p>
            
            <h4 className="font-medium mt-4 mb-2">Example Response:</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify({
                id: "123",
                name: "Digital Marketing Experts",
                description: "A group for digital marketing professionals",
                url: "https://facebook.com/groups/digitalmarketing",
                category: {
                  id: "456",
                  name: "Marketing"
                },
                tags: [
                  {
                    id: "789",
                    name: "digital"
                  }
                ],
                // More fields...
              }, null, 2)}
            </pre>
          </div>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">Create Group</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">POST /api/groups</code>
            <p className="mb-2">Submit a new Facebook group. Requires authentication.</p>
            
            <h4 className="font-medium mt-4 mb-2">Request Body:</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify({
                name: "Digital Marketing Experts",
                url: "https://facebook.com/groups/digitalmarketing",
                description: "A group for digital marketing professionals",
                category_id: "456",
                tags: ["789", "101"],
                size: 5000,
                activity_level: "high",
                screenshot_url: "https://example.com/screenshot.jpg"
              }, null, 2)}
            </pre>
          </div>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">Vote on Group</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">POST /api/groups/{'{id}'}/vote</code>
            <p className="mb-2">Vote on a group (upvote, downvote, or remove vote). Requires authentication.</p>
            
            <h4 className="font-medium mt-4 mb-2">Request Body:</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify({
                voteType: "up" // "up", "down", or "remove"
              }, null, 2)}
            </pre>
          </div>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">Review Group</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">POST /api/groups/{'{id}'}/review</code>
            <p className="mb-2">Submit a review for a group. Requires authentication.</p>
            
            <h4 className="font-medium mt-4 mb-2">Request Body:</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify({
                rating: 5, // 1-5
                comment: "This group has been incredibly helpful for my business!"
              }, null, 2)}
            </pre>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">List Categories</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">GET /api/categories</code>
            <p className="mb-2">Retrieve all categories with optional group count information.</p>
            
            <h4 className="font-medium mt-4 mb-2">Query Parameters:</h4>
            <ul className="list-disc pl-6 mb-4">
              <li><code>with_group_count</code> - Include group count for each category (true/false)</li>
              <li><code>sort</code> - Sort by: name, group_count (default: name)</li>
              <li><code>order</code> - Sort order: asc, desc (default: asc)</li>
            </ul>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Tags</h2>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">List Tags</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">GET /api/tags</code>
            <p className="mb-2">Retrieve tags with search and filtering options.</p>
            
            <h4 className="font-medium mt-4 mb-2">Query Parameters:</h4>
            <ul className="list-disc pl-6 mb-4">
              <li><code>q</code> - Search query for tag names</li>
              <li><code>limit</code> - Maximum number of tags to return (default: 50)</li>
              <li><code>with_group_count</code> - Include group count for each tag (true/false)</li>
            </ul>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Users</h2>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">Get User Profile</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">GET /api/users/{'{id}'}</code>
            <p className="mb-2">Retrieve a user's profile information. Returns basic info for public profiles and detailed info for the authenticated user's own profile.</p>
          </div>
          
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-medium mb-2">Update User Profile</h3>
            <code className="block bg-gray-100 p-2 rounded mb-2">PUT /api/users/{'{id}'}</code>
            <p className="mb-2">Update a user's profile information. Requires authentication and can only be used for the authenticated user's own profile.</p>
            
            <h4 className="font-medium mt-4 mb-2">Request Body:</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify({
                display_name: "John Smith",
                avatar_url: "https://example.com/avatar.jpg"
              }, null, 2)}
            </pre>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Error Handling</h2>
          <p className="mb-2">All API endpoints return standard HTTP status codes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><code>200</code> - Success</li>
            <li><code>201</code> - Created</li>
            <li><code>400</code> - Bad Request (invalid parameters)</li>
            <li><code>401</code> - Unauthorized (authentication required)</li>
            <li><code>403</code> - Forbidden (insufficient permissions)</li>
            <li><code>404</code> - Not Found</li>
            <li><code>500</code> - Internal Server Error</li>
          </ul>
          
          <p className="mb-2">Error responses have the following format:</p>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify({
              error: "Error message describing what went wrong"
            }, null, 2)}
          </pre>
        </section>
      </main>
      <Footer />
    </div>
  );
} 