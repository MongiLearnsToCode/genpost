'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setImageUrl(user.imageUrl || '')
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      await user.update({
        firstName: firstName,
        lastName: lastName,
        // Clerk's user.update() can also take imageUrl, but it's often handled by user.updateUserProfile()
        // For simplicity here, we'll use the fields available directly on .update()
        // If direct imageUrl update via user.update is problematic,
        // we might need user.updateUserProfile({ profileImageUrl: imageUrl })
        // Let's try with this first, then adjust if needed.
      })
      // To update image, Clerk recommends user.setProfileImage if you have a file.
      // Or user.update({ imageUrl: newImageUrl }) if you have a URL.
      // Let's ensure imageUrl is also updated if it's changed.
      if (user.imageUrl !== imageUrl) {
        await user.update({ imageUrl: imageUrl })
      }

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div> // Or a skeleton loader
  }

  if (!user) {
    return <div>User not found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your profile settings here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.primaryEmailAddress?.emailAddress || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Profile Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isLoading}
              placeholder="https://example.com/your-image.png"
            />
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Profile preview" className="w-20 h-20 rounded-full object-cover" />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
