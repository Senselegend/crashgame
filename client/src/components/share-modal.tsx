import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  winAmount: number;
  multiplier: number;
  betAmount: number;
}

export function ShareModal({ isOpen, onClose, winAmount, multiplier, betAmount }: ShareModalProps) {
  const { toast } = useToast();
  const [shareText, setShareText] = useState('');

  const generateShareText = () => {
    const profit = winAmount - betAmount;
    const profitPercent = ((profit / betAmount) * 100).toFixed(1);
    
    return `🛸 Just hit ${multiplier.toFixed(2)}x on CrashGame! 💰\n` +
           `Bet: ${betAmount.toLocaleString()} credits\n` +
           `Won: ${winAmount.toLocaleString()} credits\n` +
           `Profit: +${profit.toLocaleString()} (${profitPercent}%)\n\n` +
           `#CrashGame #BigWin #Crypto`;
  };

  const handleShare = (platform: string) => {
    const text = shareText || generateShareText();
    const url = window.location.origin;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?title=${encodeURIComponent('Big Win on CrashGame!')}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    const text = shareText || generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Share text copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const generateImage = () => {
    // Create a canvas for generating share image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Title
    ctx.fillStyle = '#00D9FF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛸 CrashGame Big Win! 🛸', 300, 80);

    // Stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Multiplier: ${multiplier.toFixed(2)}x`, 300, 150);
    ctx.fillText(`Bet: ${betAmount.toLocaleString()} credits`, 300, 190);
    ctx.fillText(`Won: ${winAmount.toLocaleString()} credits`, 300, 230);
    
    const profit = winAmount - betAmount;
    ctx.fillStyle = '#00ff88';
    ctx.fillText(`Profit: +${profit.toLocaleString()} credits`, 300, 270);

    // Download the image
    const link = document.createElement('a');
    link.download = `crashgame-win-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: 'Image Generated!',
      description: 'Share image has been downloaded',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-game-darker border-game-purple/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-share text-game-green"></i>
            Share Your Big Win!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Win Summary */}
          <div className="bg-game-dark/50 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-2xl font-bold text-game-green">
              {multiplier.toFixed(2)}x Multiplier
            </div>
            <div className="text-lg text-white">
              Won {winAmount.toLocaleString()} credits
            </div>
            <div className="text-sm text-slate-400">
              Profit: +{(winAmount - betAmount).toLocaleString()} credits
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Customize your message:
            </label>
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder={generateShareText()}
              className="w-full h-20 p-3 bg-game-dark border border-game-purple/30 rounded-lg text-white text-sm resize-none"
            />
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => handleShare('twitter')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <i className="fab fa-twitter mr-2"></i>
              Twitter
            </Button>
            <Button 
              onClick={() => handleShare('telegram')}
              className="bg-blue-400 hover:bg-blue-500"
            >
              <i className="fab fa-telegram mr-2"></i>
              Telegram
            </Button>
            <Button 
              onClick={() => handleShare('whatsapp')}
              className="bg-green-500 hover:bg-green-600"
            >
              <i className="fab fa-whatsapp mr-2"></i>
              WhatsApp
            </Button>
            <Button 
              onClick={() => handleShare('reddit')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <i className="fab fa-reddit mr-2"></i>
              Reddit
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              className="border-game-purple/30 hover:bg-game-purple/20"
            >
              <i className="fas fa-copy mr-2"></i>
              Copy Text
            </Button>
            <Button 
              onClick={generateImage}
              variant="outline"
              className="border-game-purple/30 hover:bg-game-purple/20"
            >
              <i className="fas fa-image mr-2"></i>
              Save Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}