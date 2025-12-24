import React from 'react';
import { MeetLinkButton, QuickMeetActions, MeetLinkDialog, QuickMeetIcon, QuickMeetButton } from './index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useMeet } from '../../hooks/useMeet';

// Ví dụ sử dụng các component Meet
export const MeetExample: React.FC = () => {
  const mentorId = 1;
  const studentId = 2;

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Meet Link Components</CardTitle>
          <CardDescription>
            Các component để tạo và quản lý Google Meet links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic buttons */}
          <div className="space-y-2">
            <h4 className="font-medium">Basic Buttons</h4>
            <div className="flex gap-2 flex-wrap">
              <MeetLinkButton />
              <MeetLinkButton action="copy" variant="outline" />
              <MeetLinkButton action="open" variant="secondary" />
            </div>
          </div>

          {/* Buttons with mentor/student IDs */}
          <div className="space-y-2">
            <h4 className="font-medium">Session-specific Buttons</h4>
            <div className="flex gap-2 flex-wrap">
              <MeetLinkButton 
                mentorId={mentorId} 
                studentId={studentId}
                variant="default"
              >
                Tạo Meet cho Session
              </MeetLinkButton>
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <h4 className="font-medium">Quick Actions</h4>
            <QuickMeetActions mentorId={mentorId} studentId={studentId} />
          </div>

          {/* Dialog */}
          <div className="space-y-2">
            <h4 className="font-medium">Meet Dialog</h4>
            <div className="flex gap-2">
              <MeetLinkDialog />
              <MeetLinkDialog 
                mentorId={mentorId} 
                studentId={studentId}
                trigger={
                  <MeetLinkButton variant="outline">
                    Mở Dialog Session
                  </MeetLinkButton>
                }
              />
            </div>
          </div>

          {/* Quick Meet Icons */}
          <div className="space-y-2">
            <h4 className="font-medium">Quick Meet Icons</h4>
            <div className="flex gap-2 items-center">
              <QuickMeetIcon />
              <QuickMeetIcon variant="outline" />
              <QuickMeetIcon variant="ghost" />
              <QuickMeetButton />
              <QuickMeetButton className="bg-green-600 hover:bg-green-700">
                Tạo Meet ngay
              </QuickMeetButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



// Hook usage example
export const HookExample: React.FC = () => {
  const { 
    isLoading, 
    error, 
    generateMeetLink, 
    generateAndCopyMeetLink 
  } = useMeet();

  const handleCustomAction = async () => {
    try {
      const link = await generateMeetLink();
      console.log('Generated meet link:', link);
      
      // Custom logic here
      // Ví dụ: lưu vào database, gửi notification, etc.
      
    } catch (error) {
      console.error('Custom error handling:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Hook Usage</CardTitle>
        <CardDescription>
          Sử dụng useMeet hook cho logic tùy chỉnh
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm">
              Error: {error}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleCustomAction}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Custom Action'}
            </Button>
            
            <Button 
              onClick={generateAndCopyMeetLink}
              disabled={isLoading}
              variant="outline"
            >
              Quick Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};