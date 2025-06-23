import React from 'react';

import { Card, CardContent } from '../../components/ui/card';

export function UnsupportedPage() {
  return (
    <Card className='border-none w-[300px]'>
      <CardContent className='space-y-4 text-center py-8'>
        <p className='text-sm text-gray-600'>
          PerfectPixel не может быть использован на этой странице
        </p>
      </CardContent>
    </Card>
  );
}
