import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleUserRound, Users } from "lucide-react";
import ProfileAnalysis from "./profile-analysis";
import ProfileComparison from "./profile-comparison";

export default function AnalysisSelector() {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="text-xl text-blue-700">LeetCode Profile Analysis</CardTitle>
          <CardDescription>
            Analyze your coding performance or compare multiple profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <CircleUserRound className="h-4 w-4" />
                <span>Personal Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Profile Comparison</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <ProfileAnalysis />
            </TabsContent>
            
            <TabsContent value="comparison">
              <ProfileComparison />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}