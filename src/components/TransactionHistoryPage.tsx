import { ShoppingBag, Store, Calendar, User as UserIcon, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TransactionHistoryPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

const purchasedTransactions = [
  {
    id: "1",
    productName: "登山自行車",
    price: "NT$9,600",
    sellerName: "黃美惠",
    status: "已完成",
    statusType: "completed" as const,
    orderDate: "2024 年 11 月 15 日",
    image: "https://images.unsplash.com/photo-1652640867694-afdac071d881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjI4Mzk3MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    productName: "無線耳機",
    price: "NT$2,850",
    sellerName: "林志豪",
    status: "交易中",
    statusType: "in-progress" as const,
    orderDate: "2024 年 11 月 18 日",
    image: "https://images.unsplash.com/photo-1649956736509-f359d191bbcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbXVzaWN8ZW58MXx8fHwxNzYyODE5NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    productName: "北歐風檯燈",
    price: "NT$1,200",
    sellerName: "陳雅文",
    status: "已完成",
    statusType: "completed" as const,
    orderDate: "2024 年 11 月 10 日",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1wJTIwbW9kZXJufGVufDF8fHx8MTc2Mjg3MDMzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "4",
    productName: "日式陶瓷餐具組",
    price: "NT$1,800",
    sellerName: "王小華",
    status: "已取消",
    statusType: "cancelled" as const,
    orderDate: "2024 年 11 月 5 日",
    image: "https://images.unsplash.com/photo-1539868916535-42f3c2e0f84c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNoZXMlMjBjZXJhbWljfGVufDF8fHx8MTc2Mjg3MDM1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

const soldTransactions = [
  {
    id: "5",
    productName: "復古實木椅",
    price: "NT$2,550",
    buyerName: "陳佳玲",
    status: "交易中",
    statusType: "in-progress" as const,
    orderDate: "2024 年 11 月 19 日",
    image: "https://images.unsplash.com/photo-1759643161985-5fcb6dfc9a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzYyODY0NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "6",
    productName: "復古相機組",
    price: "NT$8,400",
    buyerName: "李志明",
    status: "已完成",
    statusType: "completed" as const,
    orderDate: "2024 年 11 月 12 日",
    image: "https://images.unsplash.com/photo-1530519507795-42213b27dabf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWNvbmRoYW5kJTIwY2FtZXJhfGVufDF8fHx8MTc2Mjg2OTY5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "7",
    productName: "設計師皮件",
    price: "NT$3,200",
    buyerName: "張雅婷",
    status: "已完成",
    statusType: "completed" as const,
    orderDate: "2024 年 11 月 8 日",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYmFnfGVufDF8fHx8MTc2Mjg3MDM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

const getStatusBadgeVariant = (statusType: string) => {
  switch (statusType) {
    case 'completed':
      return 'default';
    case 'in-progress':
      return 'secondary';
    case 'cancelled':
      return 'outline';
    default:
      return 'default';
  }
};

export function TransactionHistoryPage({ onNavigate }: TransactionHistoryPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('profile')}
            className="mb-4 -ml-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回個人資料
          </Button>
          <h1 className="mb-2">交易紀錄</h1>
          <p className="text-muted-foreground">查看您的所有購買和銷售記錄</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="purchased" className="space-y-6">
          <TabsList className="bg-white border border-border rounded-xl p-1">
            <TabsTrigger value="purchased" className="rounded-lg">
              <ShoppingBag className="w-4 h-4 mr-2" />
              我購買的
            </TabsTrigger>
            <TabsTrigger value="sold" className="rounded-lg">
              <Store className="w-4 h-4 mr-2" />
              我賣出的
            </TabsTrigger>
          </TabsList>

          {/* Purchased Transactions */}
          <TabsContent value="purchased" className="space-y-4">
            <div className="mb-4">
              <p className="text-muted-foreground">共 {purchasedTransactions.length} 筆交易</p>
            </div>

            <div className="space-y-4">
              {purchasedTransactions.map((transaction) => (
                <Card 
                  key={transaction.id}
                  className="rounded-2xl border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <ImageWithFallback
                          src={transaction.image}
                          alt={transaction.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">{transaction.productName}</div>
                            <div className="mb-2">{transaction.price}</div>
                          </div>
                          <Badge 
                            variant={getStatusBadgeVariant(transaction.statusType)}
                            className="rounded-full w-fit"
                          >
                            {transaction.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">賣家：{transaction.sellerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{transaction.orderDate}</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full w-full sm:w-auto"
                          onClick={() => onNavigate('product-detail', transaction.id)}
                        >
                          查看詳情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sold Transactions */}
          <TabsContent value="sold" className="space-y-4">
            <div className="mb-4">
              <p className="text-muted-foreground">共 {soldTransactions.length} 筆交易</p>
            </div>

            <div className="space-y-4">
              {soldTransactions.map((transaction) => (
                <Card 
                  key={transaction.id}
                  className="rounded-2xl border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <ImageWithFallback
                          src={transaction.image}
                          alt={transaction.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">{transaction.productName}</div>
                            <div className="mb-2">{transaction.price}</div>
                          </div>
                          <Badge 
                            variant={getStatusBadgeVariant(transaction.statusType)}
                            className="rounded-full w-fit"
                          >
                            {transaction.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">買家：{transaction.buyerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{transaction.orderDate}</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full w-full sm:w-auto"
                          onClick={() => onNavigate('product-detail', transaction.id)}
                        >
                          查看詳情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}