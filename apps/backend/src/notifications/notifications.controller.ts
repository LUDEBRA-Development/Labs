import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationRecipientDto } from './dto/notification-recipient.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findForRecipient(@Query() query: ListNotificationsDto) {
    // TODO: obtener el correo del docente autenticado cuando exista el módulo 1.
    return this.notificationsService.findForRecipient(
      query.recipientEmail,
      query.onlyUnread,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NotificationRecipientDto,
  ) {
    return this.notificationsService.markAsRead(id, dto.recipientEmail);
  }
}
